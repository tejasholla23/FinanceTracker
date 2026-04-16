const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Auth middleware error:', err.message);

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
      message: "Authentication error",
      data: {}
    });
  }
};

module.exports = authMiddleware;
