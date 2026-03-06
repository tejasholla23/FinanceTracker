const Transaction = require("../models/Transaction");
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { category, amount, type, description, date, tags, isRecurring, recurringFrequency } = req.body;
    const userId = req.user?.id || "user123"; // In production, use authenticated user ID

    if (!category || !amount || !type) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const transaction = await Transaction.create({
      userId,
      category,
      amount,
      type,
      description,
      date: date || new Date(),
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || null,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all transactions for a user
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user?.id || "user123";
    const { category, type, startDate, endDate, sortBy } = req.query;

    let where = { userId };

    if (category) where.category = category;
    if (type) where.type = type;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    let order = [['date', 'DESC']]; // Default: newest first

    // Sorting
    if (sortBy === "date_asc") order = [['date', 'ASC']];
    else if (sortBy === "date_desc") order = [['date', 'DESC']];
    else if (sortBy === "amount_asc") order = [['amount', 'ASC']];
    else if (sortBy === "amount_desc") order = [['amount', 'DESC']];

    const transactions = await Transaction.findAll({ where, order });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, type, description, date, tags, isRecurring, recurringFrequency } = req.body;

    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    await transaction.update({
      category: category || transaction.category,
      amount: amount || transaction.amount,
      type: type || transaction.type,
      description: description || transaction.description,
      date: date || transaction.date,
      tags: tags || transaction.tags,
      isRecurring: isRecurring !== undefined ? isRecurring : transaction.isRecurring,
      recurringFrequency: recurringFrequency || transaction.recurringFrequency,
    });

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    await transaction.destroy();
    res.status(200).json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction statistics
exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user?.id || "user123";
    const { startDate, endDate } = req.query;

    let where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    const totalIncome = await Transaction.sum('amount', {
      where: { ...where, type: 'income' }
    });

    const totalExpenses = await Transaction.sum('amount', {
      where: { ...where, type: 'expense' }
    });

    const expensesByCategory = await Transaction.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: { ...where, type: 'expense' },
      group: ['category'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        totalIncome: totalIncome || 0,
        totalExpenses: totalExpenses || 0,
        balance: (totalIncome || 0) - (totalExpenses || 0),
        expensesByCategory: expensesByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
