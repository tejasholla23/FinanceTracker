const Transaction = require("../models/Transaction");
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");

// Valid categories and types
const VALID_CATEGORIES = [
  'Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping',
  'Health', 'Salary', 'Investment', 'Other'
];

const VALID_TYPES = ['income', 'expense'];

// Validation helpers
const validateTransactionData = (data) => {
  const errors = [];

  if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
    errors.push('Invalid or missing category');
  }

  if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!data.type || !VALID_TYPES.includes(data.type)) {
    errors.push('Type must be income or expense');
  }

  return errors;
};

const cache = require('../utils/cache');

// CREATE - Add new transaction
exports.createTransaction = async (req, res) => {
  try {
    const data = req.body;
    const validationErrors = validateTransactionData(data);

    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const transaction = await Transaction.create({
      ...data,
      userId: req.user.id
    });

    // ✅ FIXED
    cache.del(`insights_${req.user.id}`);

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// READ - Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']]
    });

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// READ - Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE - Edit transaction
exports.updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction = await transaction.update(req.body);

    // ✅ FIXED
    cache.del(`insights_${req.user.id}`);

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE - Remove transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await transaction.destroy();

    // ✅ FIXED
    cache.del(`insights_${req.user.id}`);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// READ - Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id }
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(txn => {
      const amount = parseFloat(txn.amount);
      if (txn.type === 'income') totalIncome += amount;
      if (txn.type === 'expense') totalExpenses += amount;
    });

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};