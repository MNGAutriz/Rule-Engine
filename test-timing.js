const consumerService = require('./services/consumerService');
const LoyaltyEngine = require('./engine/LoyaltyEngine');
const fs = require('fs');

async function testEventTiming() {
  console.log('🧪 Testing Event Processing Timing...');
  
  // Reset events.json to initial state
  const initialEvents = [
    {
      consumerId: 'user_003',
      eventId: 'evt_003_initial',
      eventType: 'PURCHASE',
      timestamp: '2025-06-01T15:00:00Z'
    }
  ];
  
  fs.writeFileSync('data/events.json', JSON.stringify(initialEvents, null, 2));
  
  // Check initial state
  console.log('📋 Initial State:');
  const initialPurchaseCount = await consumerService.getPurchaseCount('user_003');
  console.log('  Initial purchase count:', initialPurchaseCount);
  
  // Test event data
  const testInput = {
    eventId: 'evt_003',
    eventType: 'PURCHASE',
    timestamp: '2025-06-10T15:00:00Z',
    market: 'JP',
    channel: 'WECHAT',
    productLine: 'PREMIUM_SERIES',
    consumerId: 'user_003',
    context: {
      externalId: 'txn_500',
      storeId: ''
    },
    attributes: {
      amount: 1000,
      currency: 'JPY'
    }
  };
  
  console.log('📋 Before Processing:');
  const beforePurchaseCount = await consumerService.getPurchaseCount('user_003');
  console.log('  Purchase count before processing:', beforePurchaseCount);
  
  // Process the event
  const engine = new LoyaltyEngine();
  const result = await engine.processEvent(testInput);
  
  console.log('📋 After Processing:');
  const afterPurchaseCount = await consumerService.getPurchaseCount('user_003');
  console.log('  Purchase count after processing:', afterPurchaseCount);
  
  console.log('🎯 Results:');
  console.log('  2X rule triggered:', result.pointBreakdown.some(item => item.ruleId === 'ORDER_MULTIPLE_POINT'));
  console.log('  Point breakdown:', result.pointBreakdown);
}

testEventTiming().catch(console.error);
