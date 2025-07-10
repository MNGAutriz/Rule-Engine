// Final test of transaction history date and redemption fixes
const RulesEngine = require('./engine/RulesEngine');
const consumerService = require('./services/consumerService');

async function testCompleteTransactionHistory() {
  console.log('=== Final Transaction History Test ===');
  
  try {
    const rulesEngine = new RulesEngine();
    await rulesEngine.initializeEngine();
    
    const testConsumerId = 'CONS_FINAL_TEST';
    
    // Test 1: Purchase event
    console.log('\n--- Test 1: Purchase Event ---');
    const purchaseEvent = {
      eventId: 'purchase-test-001',
      consumerId: testConsumerId,
      eventType: 'PURCHASE',
      market: 'HK',
      channel: 'STORE',
      productLine: 'SKINCARE',
      timestamp: '2025-07-10T09:00:00.000Z',
      context: { storeId: 'HK_STORE_001', campaignCode: 'TEST2025' },
      attributes: { amount: 2000, currency: 'HKD', skuList: ['SKU001'] }
    };

    const purchaseResult = await rulesEngine.processEvent(purchaseEvent);
    console.log('✓ Purchase processed, points awarded:', purchaseResult.totalPointsAwarded);
    
    // Test 2: Redemption event
    console.log('\n--- Test 2: Redemption Event ---');
    const redemptionEvent = {
      eventId: 'redemption-test-001',
      consumerId: testConsumerId,
      eventType: 'REDEMPTION',
      market: 'HK',
      channel: 'STORE',
      productLine: 'SKINCARE',
      timestamp: '2025-07-10T11:00:00.000Z',
      context: { storeId: 'HK_STORE_001', campaignCode: 'REDEEM2025' },
      attributes: { redemptionPoints: 500, giftValue: 25 }
    };

    const redemptionResult = await rulesEngine.processEvent(redemptionEvent);
    console.log('✓ Redemption processed, points used:', Math.abs(redemptionResult.totalPointsAwarded));
    
    // Test 3: Check transaction history
    console.log('\n--- Test 3: Transaction History Check ---');
    const history = consumerService.getConsumerHistory(testConsumerId, { limit: 10 });
    
    console.log(`Found ${history.transactions.length} transactions:`);
    
    history.transactions.forEach((transaction, index) => {
      console.log(`\nTransaction ${index + 1}:`);
      console.log('  Event ID:', transaction.eventId);
      console.log('  Event Type:', transaction.eventType);
      console.log('  Timestamp:', transaction.timestamp);
      console.log('  Date Parsed:', new Date(transaction.timestamp).toLocaleString());
      console.log('  Points Awarded:', transaction.pointsAwarded);
      console.log('  Points Used:', transaction.pointsUsed);
      console.log('  Description:', transaction.description);
      console.log('  Market:', transaction.market);
      console.log('  Channel:', transaction.channel);
      
      // Validate timestamp
      if (!transaction.timestamp) {
        console.log('  ❌ ERROR: Missing timestamp!');
      } else {
        console.log('  ✅ Timestamp OK');
      }
      
      // Validate point logic
      if (transaction.eventType === 'REDEMPTION' && transaction.pointsUsed > 0) {
        console.log('  ✅ Redemption points correctly shown as used');
      } else if (transaction.eventType === 'PURCHASE' && transaction.pointsAwarded > 0) {
        console.log('  ✅ Purchase points correctly shown as awarded');
      }
    });
    
    console.log('\n🎉 All transaction history tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testCompleteTransactionHistory().catch(console.error);
