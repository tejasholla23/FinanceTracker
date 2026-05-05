const jwt = require("jsonwebtoken");
const { AuthenticationError, handleError } = require("../utils/errors");

const authMiddleware = (req, res, next) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('CRITICAL: JWT_SECRET environment variable is not set');
      throw new AuthenticationError('Server configuration error');
    }

    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
        data: {}
      });
    }

    const token = auth.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format",
        data: {}
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    const isDev = process.env.NODE_ENV === 'development';
    console.error('Auth middleware error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        data: {}
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        data: {}
      });
    }

    return res.status(500).json({
      success: false,
      message: isDev ? err.message : "Authentication error",
      data: {}
    });
  }
};

module.exports = authMiddleware;
