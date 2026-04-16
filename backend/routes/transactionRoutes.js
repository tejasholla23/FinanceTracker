const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getStatistics,
} = require("../controllers/transactionController");
const { getInsights } = require("../controllers/insightsController");

// require auth for all transaction routes
router.use(authMiddleware);

// READ - Get Insights (MUST come before /:id)
router.get("/insights", getInsights);

// CREATE - Add new transaction
router.post("/", createTransaction);

// READ - Get statistics (MUST come before /:id to avoid conflict)
router.get("/stats", getStatistics);

// READ - Get all transactions
router.get("/", getTransactions);

// READ - Get single transaction
router.get("/:id", getTransaction);

// UPDATE - Edit transaction
router.put("/:id", updateTransaction);

// DELETE - Remove transaction
router.delete("/:id", deleteTransaction);

module.exports = router;
