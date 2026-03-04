const express = require("express");
const router = express.Router();

const { register } = require("../controllers/authController");

// Register route
router.post("/register", register);

// Test route
router.get("/", (req, res) => {
    res.send("Auth route working");
});

module.exports = router;