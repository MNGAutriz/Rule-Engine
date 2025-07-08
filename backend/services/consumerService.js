const db = require('./mockDatabase');
const PointsExpirationService = require('./PointsExpirationService');
const { logger } = require('../src/utils');

const expirationService = new PointsExpirationService();

function getConsumerById(id) {
  // Get user data from consolidated users.json
  const users = db.load('users.json');
  return users[id] || null;
}

function getBalance(id) {
  const users = db.load('users.json');
  const user = users[id];
  if (user && user.balance) {
    return user.balance;
  }
  // Return default balance if user doesn't exist or has no balance
  return { total: 0, available: 0, used: 0, transactionCount: 1 };
}

function updateBalance(id, balanceData) {
  const users = db.load('users.json');
  
  // Initialize user if doesn't exist
  if (!users[id]) {
    users[id] = {
      consumerId: id,
      balance: { total: 0, available: 0, used: 0, transactionCount: 1 }
    };
  }
  
  // Initialize balance if doesn't exist
  if (!users[id].balance) {
    users[id].balance = { total: 0, available: 0, used: 0, transactionCount: 1 };
  }
  
  const oldBalance = { ...users[id].balance };
  
  // Update balance with new data
  users[id].balance = {
    total: balanceData.total,
    available: balanceData.available,
    used: balanceData.used,
    transactionCount: balanceData.transactionCount || oldBalance.transactionCount || 1
  };
  
  // Save to file
  db.save('users.json', users);
  
  logger.info('Balance updated for consumer', { 
    consumerId: id, 
    previousTotal: oldBalance.total, 
    newTotal: users[id].balance.total 
  });
  
  return users[id].balance;
}

function logEvent(event) {
  const events = db.load('events.json');
  events.push(event);
  db.save('events.json', events);
  
  // Update last order date for expiration tracking
  updateLastOrderDate(event.consumerId, event.eventType, event.timestamp);
}

// New methods for API support
function getConsumerPoints(consumerId) {
  const balance = getBalance(consumerId);
  const consumer = getConsumerById(consumerId);
  const market = consumer?.profile?.market || 'JP'; // Default to JP if no market specified
  
  // Get consumer's point history to calculate expiration
  const history = getConsumerHistory(consumerId, { limit: 100 });
  
  // Calculate next expiration based on market rules
  const expirationDetails = expirationService.getExpirationDetails(consumerId, market, {
    history,
    lastOrderDate: consumer?.engagement?.lastPurchaseDate,
    balance,
    firstOrderDate: consumer?.engagement?.firstPurchaseDate,
    registrationDate: consumer?.engagement?.registrationDate
  });
  
  return {
    consumerId,
    total: balance.total,
    available: balance.available,
    used: balance.used,
    pointsExpirationDate: expirationDetails.nextExpiration,
    expirationPolicy: expirationDetails.expirationRule,
    market: market,
    timezone: expirationDetails.timezone,
    transactionCount: balance.transactionCount || 1
  };
}

function getConsumerHistory(consumerId, options = {}) {
  const events = db.load('events.json');
  let history = events.filter(event => event.consumerId === consumerId);
  
  // Apply date filters if provided
  if (options.startDate) {
    history = history.filter(event => new Date(event.timestamp) >= new Date(options.startDate));
  }
  if (options.endDate) {
    history = history.filter(event => new Date(event.timestamp) <= new Date(options.endDate));
  }
  
  // Sort by timestamp descending (most recent first)
  history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Always use pagination - default to page 1, limit 5 if not specified
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 5;
  const offset = (page - 1) * limit;
  const totalCount = history.length;
  const totalPages = Math.ceil(totalCount / limit);
  
  // Apply pagination
  const paginatedHistory = history.slice(offset, offset + limit);
  
  // Format for API response with proper points display
  const formattedHistory = paginatedHistory.map(event => {
    // Determine points based on event type and data
    let pointsAwarded = 0;
    let pointsUsed = 0;
    
    if (event.eventType === 'REDEMPTION' && event.totalPointsUsed) {
      pointsUsed = Math.abs(event.totalPointsUsed);
    } else if (event.totalPointsAwarded) {
      pointsAwarded = event.totalPointsAwarded;
    }
    
    return {
      eventId: event.eventId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      pointsAwarded: pointsAwarded,
      pointsUsed: pointsUsed,
      description: event.pointBreakdown?.[0]?.description || 
                  (event.eventType === 'REDEMPTION' ? 'Points redeemed' : 'Points awarded'),
      market: event.market || 'JP',
      channel: event.channel || 'ONLINE'
    };
  });
  
  // Always return paginated response
  return {
    transactions: formattedHistory,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalCount: totalCount,
      limit: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

function getConsumerProfile(consumerId) {
  const profile = getConsumerById(consumerId);
  if (!profile) {
    throw new Error(`Consumer ${consumerId} not found`);
  }
  return profile;
}

// Helper method to count purchases for a consumer
function getPurchaseCount(consumerId) {
  // First try to get from user profile (authoritative source)
  const user = getConsumerById(consumerId);
  if (user && user.engagement && typeof user.engagement.totalPurchases === 'number') {
    return user.engagement.totalPurchases;
  }
  
  // Fallback to counting events (for backward compatibility)
  const events = db.load('events.json');
  return events.filter(event => 
    event.consumerId === consumerId && 
    event.eventType === 'PURCHASE'
  ).length;
}

// Helper method to get days since first purchase
function getDaysSinceFirstPurchase(consumerId) {
  const user = getConsumerById(consumerId);
  if (!user || !user.engagement || !user.engagement.firstPurchaseDate) {
    return null;
  }
  
  const firstPurchase = new Date(user.engagement.firstPurchaseDate);
  const now = new Date();
  const diffTime = Math.abs(now - firstPurchase);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Helper method to reset purchase count for testing
function resetPurchaseCount(consumerId, targetCount) {
  const events = db.load('events.json');
  const userEvents = events.filter(event => event.consumerId === consumerId);
  const purchaseEvents = userEvents.filter(event => event.eventType === 'PURCHASE');
  
  // Remove excess purchase events
  if (purchaseEvents.length > targetCount) {
    const eventsToRemove = purchaseEvents.slice(targetCount);
    const filteredEvents = events.filter(event => 
      !eventsToRemove.some(removeEvent => removeEvent.eventId === event.eventId)
    );
    db.save('events.json', filteredEvents);
  }
  
  logger.info('Reset purchase count for consumer', { consumerId, targetCount });
  return targetCount;
}

// Helper method to reset balance for testing
function resetBalance(consumerId, balanceData) {
  const users = db.load('users.json');
  if (users[consumerId]) {
    users[consumerId].balance = balanceData;
    db.save('users.json', users);
    logger.info('Reset balance for consumer', { consumerId, balanceData });
  }
  return balanceData;
}

// Helper method to update last order date for expiration calculations
function updateLastOrderDate(consumerId, eventType, timestamp) {
  if (eventType === 'PURCHASE' || eventType === 'ORDER') {
    const users = db.load('users.json');
    
    if (!users[consumerId]) {
      users[consumerId] = {
        consumerId: consumerId,
        profile: {},
        engagement: {},
        balance: { total: 0, available: 0, used: 0, version: 1 }
      };
    }
    
    // Ensure engagement section exists
    if (!users[consumerId].engagement) {
      users[consumerId].engagement = {};
    }
    
    // Update last purchase date in engagement section
    users[consumerId].engagement.lastPurchaseDate = timestamp;
    
    // Determine market if not set (can be enhanced with more logic)
    if (!users[consumerId].profile?.market) {
      if (!users[consumerId].profile) users[consumerId].profile = {};
      users[consumerId].profile.market = 'JP'; // Default market
    }
    
    db.save('users.json', users);
  }
}

// Helper method to set consumer market
function setConsumerMarket(consumerId, market) {
  const users = db.load('users.json');
  
  if (!users[consumerId]) {
    users[consumerId] = {
      consumerId: consumerId,
      profile: {},
      balance: { total: 0, available: 0, used: 0, version: 1 }
    };
  }
  
  if (!users[consumerId].profile) {
    users[consumerId].profile = {};
  }
  
  users[consumerId].profile.market = market;
  db.save('users.json', users);
  
  logger.info('Market updated for consumer', { consumerId, market });
  return users[consumerId];
}

// Helper method to get expiration details for a consumer
function getExpirationDetails(consumerId, market = null) {
  const consumer = getConsumerById(consumerId);
  const actualMarket = market || consumer?.profile?.market || 'JP';
  const history = getConsumerHistory(consumerId, { limit: 100 });
  const balance = getBalance(consumerId);
  
  return expirationService.getExpirationDetails(consumerId, actualMarket, {
    history,
    lastOrderDate: consumer?.engagement?.lastPurchaseDate,
    balance,
    firstOrderDate: consumer?.engagement?.firstPurchaseDate,
    registrationDate: consumer?.engagement?.registrationDate
  });
}

// Helper method to get consumer attributes from CDP
function getConsumerAttributes(consumerId) {
  const consumer = getConsumerById(consumerId);
  if (!consumer) {
    return {
      isVIP: false,
      isBirthMonth: false,
      birthMonth: null,
      tags: [],
      tierLevel: 'STANDARD'
    };
  }

  // Extract birthMonth from nested birthDate
  const birthDate = consumer.profile?.birthDate;
  const birthMonth = birthDate ? new Date(birthDate).getMonth() + 1 : null;
  
  // Calculate if current month is birth month
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  const isBirthMonth = birthMonth === currentMonth;
  
  // Determine if VIP based on tier
  const tier = consumer.profile?.tier || 'STANDARD';
  const isVIP = tier.includes('VIP') || tier.includes('PLATINUM');

  return {
    isVIP: isVIP,
    isBirthMonth: isBirthMonth,
    birthMonth: birthMonth,
    tags: [], // No tags in the new user structure - this field is deprecated
    tierLevel: isVIP ? 'VIP' : 'STANDARD',
    registrationDate: consumer.engagement?.registrationDate,
    firstOrderDate: consumer.engagement?.firstPurchaseDate,
    market: consumer.profile?.market || 'JP'
  };
}

module.exports = { 
  getConsumerById, 
  getBalance, 
  updateBalance, 
  logEvent,
  getConsumerPoints,
  getConsumerHistory,
  getConsumerProfile,
  getPurchaseCount,
  getDaysSinceFirstPurchase,
  resetPurchaseCount,
  resetBalance,
  updateLastOrderDate,
  setConsumerMarket,
  getExpirationDetails,
  getConsumerAttributes
};
