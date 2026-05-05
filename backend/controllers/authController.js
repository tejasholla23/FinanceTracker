const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { 
  isValidEmail, 
  isValidPassword, 
  isValidName 
} = require("../utils/validation");
const { 
  ValidationError, 
  AuthenticationError 
} = require("../utils/errors");
const { 
  logAuthEvent 
} = require("../utils/logger");

// register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
        data: {}
      });
    }

    // Validate name
    if (!isValidName(name)) {
      return res.status(400).json({
        success: false,
        message: "Name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes",
        data: {}
      });
    }

    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        data: {}
      });
    }

    // Validate password
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
        data: {}
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logAuthEvent('REGISTER_DUPLICATE', false, email);
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

    logAuthEvent('REGISTER', true, email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { token, user: { id: user.id, name: user.name, email: user.email } }
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === 'development';
    console.error('Register error:', error.message);
    logAuthEvent('REGISTER_ERROR', false);
    next(error);
  }
};

// login existing user
exports.login = async (req, res, next) => {
  try {
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
      logAuthEvent('LOGIN_FAILED', false, email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: {}
      });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logAuthEvent('LOGIN_FAILED', false, email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: {}
      });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

    logAuthEvent('LOGIN', true, email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user: { id: user.id, name: user.name, email: user.email } }
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === 'development';
    console.error('Login error:', error.message);
    logAuthEvent('LOGIN_ERROR', false);
    next(error);
  }
};