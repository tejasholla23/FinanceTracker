const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function for email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function for password validation
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// register new user
exports.register = async (req, res, next) => {
  try {
    console.log('Register attempt for:', req.body.email);

    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
        data: {}
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        data: {}
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
        data: {}
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
        data: {}
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword });

    // Generate JWT
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", { expiresIn: "7d" });

    console.log('User registered successfully:', user.email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { token, user: { id: user.id, name: user.name, email: user.email } }
    });
  } catch (error) {
    console.error('Register error:', error);
    next(error);
  }
};

// login existing user
exports.login = async (req, res, next) => {
  try {
    console.log('Login attempt for:', req.body.email);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        data: {}
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        data: {}
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: {}
      });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: {}
      });
    }

    // Generate JWT
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", { expiresIn: "7d" });

    console.log('User logged in successfully:', user.email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user: { id: user.id, name: user.name, email: user.email } }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};