const express = require("express");
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { register, login } = require("../controllers/authController");

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                      // 5 attempts per window
  skipSuccessfulRequests: true,  // Don't count successful logins
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    data: {}
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register route
router.post("/register", authLimiter, register);

// Login route
router.post("/login", authLimiter, login);

// Test route
router.get("/", (req, res) => {
    res.send("Auth route working");
});

module.exports = router;