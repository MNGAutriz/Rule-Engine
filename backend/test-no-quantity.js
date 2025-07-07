const RulesEngine = require('./engine/RulesEngine');

const testEvent = {
  eventId: 'quantity_removal_test_' + Date.now(),
  eventType: 'PURCHASE', 
  timestamp: new Date().toISOString(),
  market: 'HK',
  channel: 'STORE',
  productLine: 'PREMIUM_SERIES',
  consumerId: 'user_hk_standard',
  context: { storeId: 'STORE_HK_001', campaignCode: '', adminId: 'ADMIN_001' },
  attributes: {
    amount: 1500,
    currency: 'HKD',
    skuList: ['SK_HK_001', 'SK_HK_002']
  }
};

async function test() {
  try {
    console.log('=== TESTING WITHOUT QUANTITY FIELD ===');
    console.log('Event data:', JSON.stringify(testEvent, null, 2));
    
    const rulesEngine = new RulesEngine();
    const result = await rulesEngine.processEvent(testEvent);
    
    console.log('=== SUCCESS ===');
    console.log('Total Points Awarded:', result.totalPointsAwarded);
    console.log('Resulting Balance:', result.resultingBalance);
    console.log('Point Breakdown:', result.pointBreakdown.map(p => `${p.ruleId}: ${p.points} points`));
    
    if (result.errors && result.errors.length > 0) {
      console.log('Errors:', result.errors);
    } else {
      console.log('✅ No errors - quantity field successfully removed!');
    }
    
  } catch (error) {
    console.log('=== ERROR ===');
    console.log('Error message:', error.message);
  }
}

test();
