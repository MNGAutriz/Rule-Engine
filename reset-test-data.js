const consumerService = require('./services/consumerService');

/**
 * Reset test data to initial state for validation tests
 */
async function resetTestData() {
  console.log('🔄 Resetting test data to initial state...');
  
  // Clear all events first
  const db = require('./services/mockDatabase');
  db.save('events.json', []);
  
  // Create specific purchase events for test scenarios
  const mockEvents = [
    // user_003 needs 1 purchase to trigger 2X rule (first purchase was on their first order date)
    {
      consumerId: 'user_003',
      eventId: 'mock_user_003_first_purchase',
      eventType: 'PURCHASE',
      timestamp: '2025-06-01T15:00:00Z', // This matches their firstOrderDate
      totalPointsAwarded: 100,
      pointBreakdown: [{ ruleId: 'ORDER_BASE_POINT', points: 100, description: 'First purchase' }],
      errors: [],
      resultingBalance: { total: 1250, available: 1250, used: 0, version: 19 }
    }
    // Other users start with 0 purchases
  ];
  
  // Save mock events
  db.save('events.json', mockEvents);
  
  // Reset balances to reasonable starting values
  await consumerService.resetBalance('user_003', { total: 1250, available: 1250, used: 0, version: 19 });
  await consumerService.resetBalance('user_004', { total: 3000, available: 3000, used: 0, version: 5 });
  await consumerService.resetBalance('user_007', { total: 2400, available: 2400, used: 0, version: 5 });
  await consumerService.resetBalance('user_009', { total: 3000, available: 3000, used: 0, version: 5 });
  await consumerService.resetBalance('user_011', { total: 6000, available: 6000, used: 0, version: 5 });
  await consumerService.resetBalance('user_012', { total: 0, available: 0, used: 0, version: 5 });
  
  console.log('✅ Test data reset complete');
  
  // Verify the reset
  console.log('\n📋 Verifying reset:');
  ['user_003', 'user_004', 'user_007', 'user_009', 'user_011', 'user_012'].forEach(id => {
    const count = consumerService.getPurchaseCount(id);
    console.log(`${id}: purchase count = ${count}`);
  });
}

if (require.main === module) {
  resetTestData().catch(console.error);
}

module.exports = { resetTestData };
