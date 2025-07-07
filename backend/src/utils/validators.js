/**
 * Utility functions for common validation tasks
 */

/**
 * Check if a value is a valid UUID
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check if a string is a valid ISO date
 */
function isValidISODate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.toISOString() === dateString;
}

/**
 * Check if a value is a valid email address
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a value is a valid consumer ID format
 */
function isValidConsumerId(consumerId) {
  // Assumes format like: user_hk_premium_001, user_jp_vip_002, etc.
  const consumerIdRegex = /^[a-zA-Z0-9_-]+$/;
  return typeof consumerId === 'string' && consumerIdRegex.test(consumerId) && consumerId.length > 3;
}

/**
 * Check if a market code is valid
 */
function isValidMarket(market) {
  const validMarkets = ['HK', 'JP', 'TW', 'US', 'EU'];
  return validMarkets.includes(market);
}

/**
 * Check if a channel is valid
 */
function isValidChannel(channel) {
  const validChannels = ['ONLINE', 'STORE', 'MOBILE', 'ECOMMERCE', 'PHONE', 'EMAIL'];
  return validChannels.includes(channel);
}

/**
 * Check if an event type is valid
 */
function isValidEventType(eventType) {
  const validEventTypes = [
    'PURCHASE', 'REGISTRATION', 'RECYCLE', 'CONSULTATION', 
    'ADJUSTMENT', 'REDEMPTION', 'BIRTHDAY', 'ANNIVERSARY'
  ];
  return validEventTypes.includes(eventType);
}

/**
 * Sanitize a string for safe use in filenames or IDs
 */
function sanitizeString(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if an object has all required properties
 */
function hasRequiredProperties(obj, requiredProps) {
  return requiredProps.every(prop => obj.hasOwnProperty(prop) && obj[prop] !== undefined && obj[prop] !== null);
}

/**
 * Validate pagination parameters
 */
function validatePagination(page, limit) {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  return {
    page: Math.max(1, pageNum),
    limit: Math.min(100, Math.max(1, limitNum)), // Max 100 items per page
    offset: (Math.max(1, pageNum) - 1) * Math.min(100, Math.max(1, limitNum))
  };
}

/**
 * Format currency based on market
 */
function formatCurrency(amount, market = 'JP') {
  const formatters = {
    'HK': new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD' }),
    'JP': new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }),
    'TW': new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }),
    'US': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    'EU': new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
  };
  
  return formatters[market] ? formatters[market].format(amount) : amount.toString();
}

module.exports = {
  isValidUUID,
  isValidISODate,
  isValidEmail,
  isValidConsumerId,
  isValidMarket,
  isValidChannel,
  isValidEventType,
  sanitizeString,
  deepClone,
  hasRequiredProperties,
  validatePagination,
  formatCurrency
};
