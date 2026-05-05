/**
 * Cache utilities with error handling
 */

const NodeCache = require('node-cache');
const { logCacheOperation, isDevelopment } = require('./logger');

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Safely delete cache key with error handling
 */
function clearUserCache(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const key = `insights_${userId}`;
    cache.del(key);
    logCacheOperation('delete', key, true);
    return true;
  } catch (error) {
    logCacheOperation('delete', `insights_${userId}`, false);
    console.warn(`Cache clearing warning: ${error.message}`);
    return false;
  }
}

/**
 * Safely get from cache
 */
function getFromCache(key) {
  try {
    if (!key) return null;
    const value = cache.get(key);
    if (value) {
      logCacheOperation('hit', key, true);
    }
    return value;
  } catch (error) {
    console.warn(`Cache get warning: ${error.message}`);
    return null;
  }
}

/**
 * Safely set cache
 */
function setInCache(key, value, ttl = 3600) {
  try {
    if (!key) {
      throw new Error('Cache key is required');
    }
    cache.set(key, value, ttl);
    logCacheOperation('set', key, true);
    return true;
  } catch (error) {
    console.warn(`Cache set warning: ${error.message}`);
    return false;
  }
}

/**
 * Safely delete from cache
 */
function deleteFromCache(key) {
  return clearUserCache(key.replace('insights_', ''));
}

/**
 * Export the cache instance for direct access if needed
 */
cache.clearUserCache = clearUserCache;
cache.getFromCache = getFromCache;
cache.setInCache = setInCache;
cache.deleteFromCache = deleteFromCache;

module.exports = cache;
