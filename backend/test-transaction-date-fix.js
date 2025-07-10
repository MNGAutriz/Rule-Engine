// Test transaction history date fix
const RulesEngine = require('./engine/RulesEngine');
const consumerService = require('./services/consumerService');

async function testTransactionHistoryDates() {
  console.log('=== Testing Transaction History Date Fix ===');
  
  try {
    const rulesEngine = new RulesEngine();
    await rulesEngine.initializeEngine();
    
    // Create a test event with explicit timestamp
    const testEvent = {
      eventId: 'test-date-fix-001',
      consumerId: 'CONS_DATE_TEST',
      eventType: 'PURCHASE',
      market: 'HK',
      channel: 'STORE',
      productLine: 'SKINCARE',
      timestamp: '2025-07-10T10:30:00.000Z', // Explicit timestamp
      context: {
        storeId: 'HK_STORE_001',
        campaignCode: 'DATE_TEST'
      },
      attributes: {
        amount: 1000,
        currency: 'HKD',
        skuList: ['SKU001']
      }
    };

    console.log('Processing event with timestamp:', testEvent.timestamp);
    
    // Process the event
    const result = await rulesEngine.processEvent(testEvent);
    console.log('✓ Event processed successfully');
    console.log('Points awarded:', result.totalPointsAwarded);
    
    // Check transaction history
    console.log('\n--- Checking Transaction History ---');
    const history = consumerService.getConsumerHistory('CONS_DATE_TEST', { limit: 1 });
    
    if (history.transactions && history.transactions.length > 0) {
      const latestTransaction = history.transactions[0];
      console.log('Latest transaction:');
      console.log('  Event ID:', latestTransaction.eventId);
      console.log('  Event Type:', latestTransaction.eventType);
      console.log('  Timestamp:', latestTransaction.timestamp);
      console.log('  Points Awarded:', latestTransaction.pointsAwarded);
      console.log('  Market:', latestTransaction.market);
      console.log('  Channel:', latestTransaction.channel);
      
      if (latestTransaction.timestamp) {
        console.log('✅ SUCCESS: Transaction history includes timestamp!');
        console.log('  Date parsed:', new Date(latestTransaction.timestamp).toLocaleString());
      } else {
        console.log('❌ FAILED: Transaction history still missing timestamp!');
      }
    } else {
      console.log('❌ No transaction history found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testTransactionHistoryDates().catch(console.error);
