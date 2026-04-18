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

  // Default to 'Other' if category is not provided
  if (!data.category) {
    data.category = 'Other';
  } else if (!VALID_CATEGORIES.includes(data.category)) {
    errors.push('Invalid category');
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

// READ - Get all transactions (paginated)
exports.getTransactions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (req.query.type) where.type = req.query.type;

    const { count: total, rows: transactions } = await Transaction.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      transactions,
      total,
      page,
      totalPages,
    });
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
      where: { userId: req.user.id },
      order: [['date', 'DESC']]
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};
    const trendsMap = {};

    transactions.forEach(txn => {
      const amount = parseFloat(txn.amount);
      const dateObj = new Date(txn.date);
      const monthYear = dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      if (!trendsMap[monthYear]) {
        trendsMap[monthYear] = { month: monthYear, income: 0, expense: 0 };
      }

      if (txn.type === 'income') {
        totalIncome += amount;
        trendsMap[monthYear].income += amount;
      }
      if (txn.type === 'expense') {
        totalExpenses += amount;
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + amount;
        trendsMap[monthYear].expense += amount;
      }
    });

    // Helper for category colors
    const colors = ["#FF6B6B", "#4ECDC4", "#95E1D3", "#FFA07A", "#B4A7D6", "#FFD166", "#06D6A0"];
    const expenseCategories = Object.keys(categoryTotals).map((cat, idx) => ({
      category: cat,
      amount: categoryTotals[cat],
      percentage: totalExpenses > 0 ? Math.round((categoryTotals[cat] / totalExpenses) * 100) : 0,
      color: colors[idx % colors.length]
    })).sort((a,b) => b.amount - a.amount);

    const monthlyTrend = Object.values(trendsMap).slice(0, 6); // Last 6 recorded months
    const topTransactions = transactions.slice(0, 4); // top 4 most recent

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        expenseCategories,
        topTransactions,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};