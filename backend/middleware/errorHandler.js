const { logError } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Log error securely (without exposing sensitive info in production)
  logError(req.path, err, isDev);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      data: { errors }
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      data: {}
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      data: {}
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      data: {}
    });
  }

  // Default error - don't expose error details in production
  const statusCode = err.statusCode || 500;
  const message = isDev ? (err.message || 'Internal server error') : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    data: {}
  });
};

module.exports = errorHandler;