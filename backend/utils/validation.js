/**
 * Comprehensive validation utilities
 */

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string' || email.length > 254) {
    return false;
  }
  // Safer regex for email to prevent ReDoS
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  // Minimum 10 characters
  if (password.length < 10) {
    return { 
      valid: false, 
      message: 'Password must be at least 10 characters long' 
    };
  }

  // Maximum 128 characters
  if (password.length > 128) {
    return { 
      valid: false, 
      message: 'Password must be 128 characters or less' 
    };
  }

  // Complexity requirements
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars)) {
    return {
      valid: false,
      message: 'Password must contain uppercase letters, lowercase letters, numbers, and special characters'
    };
  }

  return { valid: true };
};

const isValidName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  if (name.length < 2 || name.length > 100) {
    return false;
  }
  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name);
};

const isValidAmount = (amount) => {
  const num = Number.parseFloat(amount);
  return !Number.isNaN(num) && num > 0 && num <= 999999999;
};

const isValidDescription = (description) => {
  if (!description) return true; // Optional field
  if (typeof description !== 'string' || description.length > 500) {
    return false;
  }
  return true;
};

const sanitizeDescription = (description) => {
  if (!description) return '';
  // Remove HTML tags
  let sanitized = description.replaceAll(/<[^>]*>/gu, '');
  // Remove control characters
  sanitized = sanitized.replaceAll(/[\x00-\x1F\x7F]/gu, '');
  return sanitized.trim();
};

const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !Number.isNaN(d.getTime());
};

const isValidCategory = (category, validCategories) => {
  return validCategories.includes(category);
};

const isValidType = (type) => {
  return ['income', 'expense'].includes(type);
};

const isValidFrequency = (frequency) => {
  return ['daily', 'weekly', 'monthly', 'yearly'].includes(frequency);
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidAmount,
  isValidDescription,
  sanitizeDescription,
  isValidDate,
  isValidCategory,
  isValidType,
  isValidFrequency
};
