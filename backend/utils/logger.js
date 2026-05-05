/**
 * Secure logging utilities - masks sensitive information
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '[invalid]';
  const [localPart, domain] = email.split('@');
  const masked = localPart.substring(0, 2) + '*'.repeat(Math.max(0, localPart.length - 2)) + '@' + domain;
  return masked;
};

const maskIP = (ip) => {
  if (!ip || typeof ip !== 'string') return '[invalid]';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return parts.slice(0, 3).join('.') + '.xxx';
  }
  return ip.substring(0, 5) + '...';
};

const logAuthEvent = (event, success, email = null, ip = null) => {
  const timestamp = new Date().toISOString();
  
  // Sanitize all user-controlled strings to prevent log injection
  const safeEvent = (event || 'AUTH_EVENT').replace(/[\n\r]/g, '');
  const maskedEmail = email ? maskEmail(email).replace(/[\n\r]/g, '') : 'unknown';
  const maskedIP = ip ? maskIP(ip).replace(/[\n\r]/g, '') : 'unknown';
  
  const status = success ? '✓' : '✗';
  console.log(`[${timestamp}] ${status} ${safeEvent} (${maskedEmail}) from ${maskedIP}`);
};

const logError = (context, error, includeStack = isDevelopment) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR in ${context}: ${error.message}`);
  
  if (includeStack) {
    console.error(error.stack);
  }
};

const logQuery = (query, duration) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] QUERY (${duration}ms): ${query.substring(0, 100)}...`);
  }
};

const logCacheOperation = (operation, key, success) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const status = success ? '✓' : '✗';
    console.log(`[${timestamp}] ${status} CACHE ${operation.toUpperCase()}: ${key}`);
  }
};

module.exports = {
  maskEmail,
  maskIP,
  logAuthEvent,
  logError,
  logQuery,
  logCacheOperation,
  isDevelopment
};
