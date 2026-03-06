const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Test route
router.get("/", (req, res) => {
    res.send("Auth route working");
});

module.exports = router;