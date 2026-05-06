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
  const logObj = {
    timestamp: new Date().toISOString(),
    type: 'AUTH',
    status: success ? 'SUCCESS' : 'FAILURE',
    event: (event || 'AUTH_EVENT').replaceAll(/[\n\r]/gu, ''),
    email: email ? maskEmail(email).replaceAll(/[\n\r]/gu, '') : 'unknown',
    ip: ip ? maskIP(ip).replaceAll(/[\n\r]/gu, '') : 'unknown'
  };
  console.log(logObj);
};

const logError = (context, error, includeStack = isDevelopment) => {
  const logObj = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    context: (context || '').replaceAll(/[\n\r]/gu, '').substring(0, 500),
    message: (error.message || '').replaceAll(/[\n\r]/gu, '').substring(0, 500)
  };
  
  if (includeStack && error.stack) {
    logObj.stack = error.stack;
  }

  console.error(logObj);
};

const logQuery = (query, duration) => {
  if (isDevelopment) {
    console.log({
      timestamp: new Date().toISOString(),
      type: 'QUERY',
      duration: `${duration}ms`,
      query: (query || '').substring(0, 500)
    });
  }
};

const logCacheOperation = (operation, key, success) => {
  if (isDevelopment) {
    console.log({
      timestamp: new Date().toISOString(),
      type: 'CACHE',
      operation: (operation || '').toUpperCase(),
      key,
      status: success ? 'HIT' : 'MISS'
    });
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
