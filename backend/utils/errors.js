/**
 * Custom error classes and error utilities
 */

class AppError extends Error {
  constructor(message, statusCode = 500, type = 'internal') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'validation');
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'authentication');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'authorization');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'not_found');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'rate_limit');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'database');
  }
}

const handleError = (err, isDevelopment = false) => {
  if (err instanceof AppError) {
    return {
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      type: err.type,
      ...(err instanceof ValidationError && { errors: err.errors }),
      ...(isDevelopment && { debug: { stack: err.stack } })
    };
  }

  // Unknown error
  console.error('Unhandled error:', err);
  return {
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    statusCode: 500,
    type: 'internal',
    ...(isDevelopment && { debug: { stack: err.stack } })
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  handleError
};
