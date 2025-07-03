const db = require('./mockDatabase');

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
  return { total: 0, available: 0, used: 0, version: 1 };
}

function updateBalance(id, points) {
  console.log(`=== UPDATING BALANCE FOR ${id} ===`);
  console.log(`Points to add: ${points}`);
  
  const users = db.load('users.json');
  
  // Initialize user if doesn't exist
  if (!users[id]) {
    console.log(`Creating new user: ${id}`);
    users[id] = {
      consumerId: id,
      balance: { total: 0, available: 0, used: 0, version: 1 }
    };
  }
  
  // Initialize balance if doesn't exist
  if (!users[id].balance) {
    console.log(`Creating new balance for user: ${id}`);
    users[id].balance = { total: 0, available: 0, used: 0, version: 1 };
  }
  
  const oldBalance = { ...users[id].balance };
  console.log(`Previous balance:`, oldBalance);
  
  // Update balance
  users[id].balance.total += points;
  users[id].balance.available += points;
  users[id].balance.version += 1;
  
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
}

// New methods for API support
function getConsumerPoints(consumerId) {
  const balance = getBalance(consumerId);
  return {
    consumerId,
    total: balance.total,
    available: balance.available,
    used: balance.used,
    nextExpiration: null // Can be implemented later with expiration logic
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
  
  // Format for API response
  return history.map(event => ({
    eventId: event.eventId,
    timestamp: event.timestamp,
    eventType: event.eventType,
    points: event.totalPointsAwarded,
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
  getDaysSinceFirstPurchase
};
