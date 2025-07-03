const LoyaltyEngine = require('./engine/LoyaltyEngine');
const consumerService = require('./services/consumerService');

/**
 * Isolated test for 2X Purchase rule to verify it works correctly
 */
async function test2XPurchaseRule() {
  console.log('🧪 Testing 2X Purchase Rule in Isolation...\n');
  
  // Reset test data first
  const { resetTestData } = require('./reset-test-data');
  await resetTestData();
  
  // Verify initial state
  const initialCount = consumerService.getPurchaseCount('user_003');
  console.log(`✅ Initial purchase count for user_003: ${initialCount}`);
  
  if (initialCount !== 1) {
    console.log('❌ Initial state incorrect, purchase count should be 1');
    return;
  }
  
  // Create engine and test the scenario
  const engine = new LoyaltyEngine();
  
  const input = {
    "eventId": "test_2x_purchase",
    "eventType": "PURCHASE",
    "timestamp": "2025-06-10T15:00:00Z",
    "market": "JP",
    "channel": "WECHAT",
    "productLine": "PREMIUM_SERIES",
    "consumerId": "user_003",
    "context": {
      "externalId": "test_txn",
      "storeId": ""
    },
    "attributes": {
      "amount": 1000,
      "currency": "JPY"
    }
  };
  
  console.log('Processing 2X Purchase event...');
  const result = await engine.processEvent(input);
  
  console.log('\n📋 Result Analysis:');
  console.log('Total points awarded:', result.totalPointsAwarded);
  console.log('Rules triggered:');
  result.pointBreakdown.forEach(rule => {
    console.log(`  - ${rule.ruleId}: ${rule.points} points (${rule.description})`);
  });
  
  const hasOrderMultipleRule = result.pointBreakdown.some(rule => rule.ruleId === 'ORDER_MULTIPLE_POINT');
  console.log('\n🔍 Test Result:');
  if (hasOrderMultipleRule) {
    console.log('✅ SUCCESS: ORDER_MULTIPLE_POINT rule triggered correctly!');
  } else {
    console.log('❌ FAILED: ORDER_MULTIPLE_POINT rule did not trigger');
    
    // Debug information
    console.log('\n🔧 Debug Information:');
    console.log('- Purchase count before processing:', initialCount);
    console.log('- Days since first purchase:', consumerService.getDaysSinceFirstPurchase('user_003'));
    console.log('- Event type:', input.eventType);
    console.log('- Market:', input.market);
  }
}

// Run the test
test2XPurchaseRule().catch(console.error);
