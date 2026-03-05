const Transaction = require("../models/Transaction");

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { category, amount, type, description, date, tags, isRecurring, recurringFrequency } = req.body;
    const userId = req.user?.id || "user123"; // In production, use authenticated user ID

    if (!category || !amount || !type) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const transaction = new Transaction({
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

    await transaction.save();
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

    let filter = { userId };

    if (category) filter.category = category;
    if (type) filter.type = type;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    let query = Transaction.find(filter);

    // Sorting
    if (sortBy === "date_asc") query = query.sort({ date: 1 });
    else if (sortBy === "date_desc") query = query.sort({ date: -1 });
    else if (sortBy === "amount_asc") query = query.sort({ amount: 1 });
    else if (sortBy === "amount_desc") query = query.sort({ amount: -1 });
    else query = query.sort({ date: -1 }); // Default: newest first

    const transactions = await query;
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

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

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      {
        category: category || undefined,
        amount: amount || undefined,
        type: type || undefined,
        description: description || undefined,
        date: date || undefined,
        tags: tags || undefined,
        isRecurring: isRecurring || undefined,
        recurringFrequency: recurringFrequency || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

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

    let filter = { userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const totalIncome = await Transaction.aggregate([
      { $match: { ...filter, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpenses = await Transaction.aggregate([
      { $match: { ...filter, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const expensesByCategory = await Transaction.aggregate([
      { $match: { ...filter, type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalIncome: totalIncome[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        balance: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
        expensesByCategory: expensesByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
