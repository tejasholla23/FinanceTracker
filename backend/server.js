require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { startRecurringJob } = require('./jobs/recurringJob');

const app = express();

// Security middleware - Enable CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.API_URL || "http://localhost:5000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// HTTPS enforcement middleware - redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') === 'https') {
      return next();
    }

    // MANDATORY: Use only your trusted domain to prevent Open Redirect attacks.
    // Set this in your .env as PRODUCTION_URL=yourdomain.com
    const host = process.env.PRODUCTION_URL;
    
    if (host) {
      try {
        // Use the URL constructor to safely combine the host and path
        // This prevents protocol-relative URL injection (e.g. //malicious.com)
        const targetUrl = new URL(req.originalUrl, `https://${host}`);
        
        // STRICT CHECK: Ensure the generated URL's host matches our trusted domain
        if (targetUrl.host === host) {
          return res.redirect(301, targetUrl.href);
        }
      } catch (e) {
        console.error('Redirect error:', e.message);
      }
    }
    
    // If no production URL is set, we log a warning but don't perform the unsafe redirect
    console.warn('WARNING: PRODUCTION_URL is not set. HTTPS redirection skipped for safety.');
    next();
  });
}

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
    data: {}
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware - mask sensitive data and prevent log injection
app.use((req, res, next) => {
  // Safe IP masking without ReDoS-prone regex
  const ip = req.ip || 'unknown';
  const maskedIp = ip.length > 8 ? `${ip.slice(0, ip.lastIndexOf('.') || ip.lastIndexOf(':') || 8)}.xxx` : 'masked';
  
  // Sanitize user-controlled path to prevent log injection (CWE-117)
  const safePath = (req.path || '').replaceAll(/[\n\r]/gu, '');
  
  console.log(`${new Date().toISOString()} - ${req.method} ${safePath} - IP: ${maskedIp}`);
  next();
});

// Database connection — start recurring job only after DB is ready
connectDB().then(() => {
  startRecurringJob();
}).catch((err) => {
  console.error('❌ Failed to start DB or recurring job:', err.message);
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// 404 handler
app.use((req, res) => {
  // Sanitize path to prevent log injection
  const safePath = (req.path || '').replaceAll(/[\n\r]/gu, '');
  console.log(`404: ${req.method} ${safePath.substring(0, 100)}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: {}
  });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log("📋 Available routes:");
  console.log("  GET  /api/health");
  console.log("  POST /api/auth/register");
  console.log("  POST /api/auth/login");
  console.log("  GET  /api/transactions");
  console.log("  POST /api/transactions");
  console.log("  GET  /api/transactions/stats");
  console.log("  GET  /api/transactions/:id");
  console.log("  PUT  /api/transactions/:id");
  console.log("  DELETE /api/transactions/:id");
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;