const LoyaltyEngine = require('./engine/LoyaltyEngine');

async function testBasketThresholdDebug() {
  console.log('🧪 Testing Basket Threshold Debug...');
  
  // Reset events
  const fs = require('fs');
  fs.writeFileSync('data/events.json', '[]');
  
  const engine = new LoyaltyEngine();
  
  const testInput = {
    eventId: 'evt_008',
    eventType: 'PURCHASE',
    timestamp: '2025-06-18T12:00:00Z',
    market: 'HK',
    channel: 'LINE',
    productLine: 'PREMIUM_SERIES',
    consumerId: 'user_008',
    context: {
      externalId: 'txn_820',
      storeId: ''
    },
    attributes: {
      srpAmount: 5500,
      currency: 'HKD'
    }
  };

  console.log('📋 Input Event:', JSON.stringify(testInput, null, 2));
  
  const result = await engine.processEvent(testInput);
  
  console.log('🎯 Results:');
  console.log('  Total points:', result.totalPointsAwarded);
  console.log('  Point breakdown:', result.pointBreakdown);
  console.log('  Basket rule triggered:', result.pointBreakdown.some(item => item.ruleId === 'FLEXIBLE_BASKET_AMOUNT'));
}

testBasketThresholdDebug().catch(console.error);
