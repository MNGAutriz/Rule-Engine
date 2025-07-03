/**
 * Input validation utilities for the loyalty rules engine
 * Validates against the generalized input template
 */

/**
 * Validate event input against the generalized template
 */
function validateEventInput(input) {
  const errors = [];
  
  // Required fields validation
  const requiredFields = [
    'eventId',
    'eventType', 
    'timestamp',
    'market',
    'channel',
    'productLine',
    'consumerId'
  ];
  
  requiredFields.forEach(field => {
    if (!input[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Field type validation
  if (input.eventId && typeof input.eventId !== 'string') {
    errors.push('eventId must be a string');
  }
  
  if (input.eventType && !isValidEventType(input.eventType)) {
    errors.push('eventType must be one of: PURCHASE, REDEEM, INTERACTION, ADJUSTMENT');
  }
  
  if (input.timestamp && !isValidTimestamp(input.timestamp)) {
    errors.push('timestamp must be a valid ISO 8601 date string');
  }
  
  if (input.market && !isValidMarket(input.market)) {
    errors.push('market must be one of: JP, HK, TW');
  }
  
  if (input.channel && !isValidChannel(input.channel)) {
    errors.push('channel must be one of: LINE, WECHAT, COUNTER, APP');
  }
  
  if (input.productLine && !isValidProductLine(input.productLine)) {
    errors.push('productLine must be one of: PREMIUM_SERIES, ESSENCE_SERIES, TREATMENT_SERIES');
  }
  
  // Context validation
  if (input.context) {
    if (input.context.externalId && typeof input.context.externalId !== 'string') {
      errors.push('context.externalId must be a string');
    }
    
    if (input.context.storeId && typeof input.context.storeId !== 'string') {
      errors.push('context.storeId must be a string');
    }
  }
  
  // Attributes validation based on event type
  if (input.attributes) {
    validateAttributes(input.eventType, input.attributes, errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate attributes based on event type
 */
function validateAttributes(eventType, attributes, errors) {
  switch (eventType) {
    case 'PURCHASE':
      if (attributes.amount && typeof attributes.amount !== 'number') {
        errors.push('attributes.amount must be a number');
      }
      if (attributes.srpAmount && typeof attributes.srpAmount !== 'number') {
        errors.push('attributes.srpAmount must be a number');
      }
      if (attributes.currency && !isValidCurrency(attributes.currency)) {
        errors.push('attributes.currency must be one of: JPY, HKD, TWD');
      }
      if (attributes.skuList && !Array.isArray(attributes.skuList)) {
        errors.push('attributes.skuList must be an array');
      }
      break;
      
    case 'INTERACTION':
      if (attributes.recycledCount && typeof attributes.recycledCount !== 'number') {
        errors.push('attributes.recycledCount must be a number');
      }
      if (attributes.skinTestDate && !isValidDate(attributes.skinTestDate)) {
        errors.push('attributes.skinTestDate must be a valid date string');
      }
      break;
      
    case 'ADJUSTMENT':
      if (attributes.adjustedPoints === undefined) {
        errors.push('attributes.adjustedPoints is required for ADJUSTMENT events');
      }
      if (attributes.adjustedPoints && typeof attributes.adjustedPoints !== 'number') {
        errors.push('attributes.adjustedPoints must be a number');
      }
      break;
      
    case 'REDEEM':
      if (attributes.redeemedGiftCode && typeof attributes.redeemedGiftCode !== 'string') {
        errors.push('attributes.redeemedGiftCode must be a string');
      }
      break;
  }
}

/**
 * Helper validation functions
 */
function isValidEventType(eventType) {
  const validTypes = ['PURCHASE', 'REDEEM', 'INTERACTION', 'ADJUSTMENT'];
  return validTypes.includes(eventType);
}

function isValidTimestamp(timestamp) {
  const date = new Date(timestamp);
  return !isNaN(date.getTime()) && timestamp.includes('T');
}

function isValidMarket(market) {
  const validMarkets = ['JP', 'HK', 'TW'];
  return validMarkets.includes(market);
}

function isValidChannel(channel) {
  const validChannels = ['LINE', 'WECHAT', 'COUNTER', 'APP'];
  return validChannels.includes(channel);
}

function isValidProductLine(productLine) {
  const validProductLines = ['PREMIUM_SERIES', 'ESSENCE_SERIES', 'TREATMENT_SERIES'];
  return validProductLines.includes(productLine);
}

function isValidCurrency(currency) {
  const validCurrencies = ['JPY', 'HKD', 'TWD'];
  return validCurrencies.includes(currency);
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate campaign input
 */
function validateCampaignInput(input) {
  const errors = [];
  
  const requiredFields = ['campaignCode', 'name', 'startDate', 'endDate', 'market'];
  
  requiredFields.forEach(field => {
    if (!input[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  if (input.startDate && !isValidTimestamp(input.startDate)) {
    errors.push('startDate must be a valid ISO 8601 date string');
  }
  
  if (input.endDate && !isValidTimestamp(input.endDate)) {
    errors.push('endDate must be a valid ISO 8601 date string');
  }
  
  if (input.startDate && input.endDate && new Date(input.startDate) >= new Date(input.endDate)) {
    errors.push('startDate must be before endDate');
  }
  
  if (input.market && !isValidMarket(input.market) && input.market !== 'ALL') {
    errors.push('market must be one of: JP, HK, TW, ALL');
  }
  
  if (input.channel && !isValidChannel(input.channel) && input.channel !== 'ALL') {
    errors.push('channel must be one of: LINE, WECHAT, COUNTER, APP, ALL');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateEventInput,
  validateCampaignInput,
  isValidEventType,
  isValidMarket,
  isValidChannel,
  isValidCurrency
};
