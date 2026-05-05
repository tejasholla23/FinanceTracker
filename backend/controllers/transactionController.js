const Transaction = require("../models/Transaction");
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");
const { 
  isValidAmount, 
  isValidDescription, 
  sanitizeDescription,
  isValidCategory,
  isValidType,
  isValidFrequency
} = require("../utils/validation");
const cache = require('../utils/cacheHelper');

// Valid categories and types
const VALID_CATEGORIES = [
  'Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping',
  'Health', 'Salary', 'Investment', 'Other'
];

const VALID_TYPES = ['income', 'expense'];

// Comprehensive validation with field limits
const validateTransactionData = (data, isUpdate = false) => {
  const errors = [];

  // Amount validation
  if (!isUpdate || data.amount !== undefined) {
    if (!data.amount || !isValidAmount(data.amount)) {
      errors.push('Amount must be a positive number between 0.01 and 999,999,999');
    }
  }

  // Type validation
  if (!isUpdate || data.type !== undefined) {
    if (!data.type || !isValidType(data.type)) {
      errors.push('Type must be income or expense');
    }
  }

  // Category validation
  if (!isUpdate || data.category !== undefined) {
    if (data.category && !isValidCategory(data.category, VALID_CATEGORIES)) {
      errors.push(`Invalid category. Valid categories: ${VALID_CATEGORIES.join(', ')}`);
    } else if (!data.category) {
      data.category = 'Other'; // Default
    }
  }

  // Description validation
  if (!isUpdate || data.description !== undefined) {
    if (!isValidDescription(data.description)) {
      errors.push('Description must be 500 characters or less');
    } else if (data.description) {
      data.description = sanitizeDescription(data.description);
    }
  }

  // Date validation
  if (!isUpdate || data.date !== undefined) {
    if (data.date && isNaN(Date.parse(data.date))) {
      errors.push('Invalid date format');
    }
  }

  // Recurring validation
  if (data.isRecurring !== undefined) {
    if (typeof data.isRecurring !== 'boolean') {
      errors.push('isRecurring must be boolean');
    }
    if (data.isRecurring && data.recurringFrequency) {
      if (!isValidFrequency(data.recurringFrequency)) {
        errors.push('Invalid recurring frequency. Valid options: daily, weekly, monthly, yearly');
      }
    }
  }

  return errors;
};

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

    // Clear cache with error handling
    cache.clearUserCache(req.user.id);

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
    if (req.query.type && isValidType(req.query.type)) {
      where.type = req.query.type;
    }

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

// UPDATE - Edit transaction with validation
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Validate input for updates
    const validationErrors = validateTransactionData(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    // Only allow specific fields to be updated
    const allowedFields = ['category', 'amount', 'type', 'description', 'date', 'isRecurring', 'recurringFrequency'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await transaction.update(updateData);
    
    // Clear cache with error handling
    cache.clearUserCache(req.user.id);

    res.status(200).json({ success: true, data: updated });
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

    // Clear cache with error handling
    cache.clearUserCache(req.user.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// READ - Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Default to current month/year if not provided
    const now = new Date();
    const targetMonth = month !== undefined ? parseInt(month) : now.getMonth();
    const targetYear = year !== undefined ? parseInt(year) : now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Fetch transactions for the specific month for totals and trend
    const monthTransactions = await Transaction.findAll({
      where: { 
        userId: req.user.id,
        date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },
      order: [['date', 'DESC']]
    });

    // Fetch TOP 4 most recent transactions GLOBALLY (not filtered by month)
    const topTransactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
      limit: 4
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};
    const trendsMap = {};

    monthTransactions.forEach(txn => {
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

    const monthlyTrend = Object.values(trendsMap).slice(0, 6);

    res.status(200).json({
      success: true,
      data: {
        totalIncome: totalIncome || 0,
        totalExpenses: totalExpenses || 0,
        balance: (totalIncome || 0) - (totalExpenses || 0),
        expenseCategories: expenseCategories || [],
        topTransactions: topTransactions || [],
        monthlyTrend: monthlyTrend || [],
        period: {
          month: targetMonth,
          year: targetYear,
          name: startOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        }
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};