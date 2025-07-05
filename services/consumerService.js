const db = require('./mockDatabase');
const PointsExpirationService = require('./PointsExpirationService');

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
  return { total: 0, available: 0, used: 0, accountVersion: 1 };
}

function updateBalance(id, balanceData) {
  console.log(`=== UPDATING BALANCE FOR ${id} ===`);
  console.log(`Balance data:`, balanceData);
  
  const users = db.load('users.json');
  
  // Initialize user if doesn't exist
  if (!users[id]) {
    console.log(`Creating new user: ${id}`);
    users[id] = {
      consumerId: id,
      balance: { total: 0, available: 0, used: 0, accountVersion: 1 }
    };
  }
  
  // Initialize balance if doesn't exist
  if (!users[id].balance) {
    console.log(`Creating new balance for user: ${id}`);
    users[id].balance = { total: 0, available: 0, used: 0, accountVersion: 1 };
  }
  
  const oldBalance = { ...users[id].balance };
  console.log(`Previous balance:`, oldBalance);
  
  // Update balance with new data
  users[id].balance = {
    total: balanceData.total,
    available: balanceData.available,
    used: balanceData.used,
    accountVersion: balanceData.accountVersion || oldBalance.accountVersion || 1
  };
  
  console.log(`New balance:`, users[id].balance);
  
  // Save to file
  db.save('users.json', users);
  
  console.log(`=== BALANCE UPDATE COMPLETE ===`);
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
  const market = consumer?.market || 'JP'; // Default to JP if no market specified
  
  // Get consumer's point history to calculate expiration
  const history = getConsumerHistory(consumerId, { limit: 100 });
  
  // Calculate next expiration based on market rules
  const expirationDetails = expirationService.getExpirationDetails(consumerId, market, {
    history,
    lastOrderDate: consumer?.lastOrderDate,
    balance,
    firstOrderDate: consumer?.firstOrderDate,
    registrationDate: consumer?.registrationDate
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
    accountVersion: balance.accountVersion || 1
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
  
  // Apply limit
  if (options.limit) {
    history = history.slice(0, options.limit);
  }
  
  // Format for API response to match the expected format
  return history.map(event => ({
    eventId: event.eventId,
    timestamp: event.timestamp,
    eventType: event.eventType,
    points: event.totalPointsAwarded || 0,
    ruleId: event.pointBreakdown?.[0]?.ruleId || 'UNKNOWN',
    description: event.pointBreakdown?.[0]?.description || 'Points awarded'
  }));
}

function getConsumerProfile(consumerId) {
  const profile = getConsumerById(consumerId);
  if (!profile) {
    throw new Error(`Consumer ${consumerId} not found`);
  }
  return profile;
}

function updateConsumerProfile(consumerId, profileData) {
  if (!cdpMockData[consumerId]) {
    cdpMockData[consumerId] = { consumerId };
  }
  
  Object.assign(cdpMockData[consumerId], profileData);
  return cdpMockData[consumerId];
}

// Helper method to check if consumer has made purchases within timeframe
function hasPurchaseWithinDays(consumerId, days) {
  const events = db.load('events.json');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return events.some(event => 
    event.consumerId === consumerId && 
    event.eventType === 'PURCHASE' && 
    new Date(event.timestamp) >= cutoffDate
  );
}

// Helper method to count purchases for a consumer
function getPurchaseCount(consumerId) {
  const events = db.load('events.json');
  return events.filter(event => 
    event.consumerId === consumerId && 
    event.eventType === 'PURCHASE'
  ).length;
}

// Helper method to get days since first purchase
function getDaysSinceFirstPurchase(consumerId) {
  const profile = getConsumerById(consumerId);
  if (!profile || !profile.firstOrderDate) {
    return null;
  }
  
  const firstPurchase = new Date(profile.firstOrderDate);
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
  
  console.log(`Reset purchase count for ${consumerId} to ${targetCount}`);
  return targetCount;
}

// Helper method to reset balance for testing
function resetBalance(consumerId, balanceData) {
  const users = db.load('users.json');
  if (users[consumerId]) {
    users[consumerId].balance = balanceData;
    db.save('users.json', users);
    console.log(`Reset balance for ${consumerId}:`, balanceData);
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
        balance: { total: 0, available: 0, used: 0, version: 1 }
      };
    }
    
    // Update last order date
    users[consumerId].lastOrderDate = timestamp;
    
    // Determine market if not set (can be enhanced with more logic)
    if (!users[consumerId].market) {
      users[consumerId].market = 'JP'; // Default market
    }
    
    db.save('users.json', users);
    console.log(`Updated last order date for ${consumerId}: ${timestamp}`);
  }
}

// Helper method to set consumer market
function setConsumerMarket(consumerId, market) {
  const users = db.load('users.json');
  
  if (!users[consumerId]) {
    users[consumerId] = {
      consumerId: consumerId,
      balance: { total: 0, available: 0, used: 0, version: 1 }
    };
  }
  
  users[consumerId].market = market;
  db.save('users.json', users);
  console.log(`Set market for ${consumerId}: ${market}`);
  return users[consumerId];
}

// Helper method to get expiration details for a consumer
function getExpirationDetails(consumerId, market = null) {
  const consumer = getConsumerById(consumerId);
  const actualMarket = market || consumer?.market || 'JP';
  const history = getConsumerHistory(consumerId, { limit: 100 });
  const balance = getBalance(consumerId);
  
  return expirationService.getExpirationDetails(consumerId, actualMarket, {
    history,
    lastOrderDate: consumer?.lastOrderDate,
    balance,
    firstOrderDate: consumer?.firstOrderDate,
    registrationDate: consumer?.registrationDate
  });
}

module.exports = { 
  getConsumerById, 
  getBalance, 
  updateBalance, 
  logEvent,
  getConsumerPoints,
  getConsumerHistory,
  getConsumerProfile,
  updateConsumerProfile,
  hasPurchaseWithinDays,
  getPurchaseCount,
  getDaysSinceFirstPurchase,
  resetPurchaseCount,
  resetBalance,
  updateLastOrderDate,
  setConsumerMarket,
  getExpirationDetails
};
