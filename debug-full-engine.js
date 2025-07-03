const LoyaltyEngine = require('./engine/LoyaltyEngine');

async function debugFullEngine() {
  console.log('🧪 Testing Full Engine with 2X Purchase...');
  
  const engine = new LoyaltyEngine();
  
  // Test event data for 2X purchase in 60 days scenario
  const testInput = {
    "eventId": "evt_003",
    "eventType": "PURCHASE",
    "timestamp": "2025-06-10T15:00:00Z",
    "market": "JP",
    "channel": "WECHAT",
    "productLine": "PREMIUM_SERIES",
    "consumerId": "user_003",
    "context": {
      "externalId": "txn_500",
      "storeId": ""
    },
    "attributes": {
      "amount": 1000,
      "currency": "JPY"
    }
  };

  console.log('📋 Input Event:', JSON.stringify(testInput, null, 2));
  
  // Enable debug logging
  console.log('🔍 Running engine with debug info...');
  
  try {
    const result = await engine.processEvent(testInput);
    console.log('✅ Engine result:', JSON.stringify(result, null, 2));
    
    // Check if 2X rule was triggered
    const has2XRule = result.pointBreakdown.some(item => item.ruleId === 'ORDER_MULTIPLE_POINT');
    console.log(`🎯 2X Rule triggered: ${has2XRule}`);
    
    if (!has2XRule) {
      console.log('❌ 2X Rule not triggered - checking rule conditions...');
      
      // Let's check if the rule exists in the loaded rules
      const rules = engine.engine.rules;
      console.log(`📊 Total rules loaded: ${rules.length}`);
      
      const multiplierRule = rules.find(rule => rule.name === 'Second Purchase Within 60 Days');
      if (multiplierRule) {
        console.log('✅ 2X Purchase rule found in loaded rules');
        console.log('Rule conditions:', JSON.stringify(multiplierRule.conditions, null, 2));
        
        // Test the facts manually
        console.log('🔍 Testing rule conditions manually...');
        const eventType = await engine.engine.almanac.factValue('eventType');
        const daysSinceFirstPurchase = await engine.engine.almanac.factValue('daysSinceFirstPurchase');
        const purchaseCount = await engine.engine.almanac.factValue('purchaseCount');
        
        console.log(`  eventType: ${eventType} (should be PURCHASE)`);
        console.log(`  daysSinceFirstPurchase: ${daysSinceFirstPurchase} (should be <= 60)`);
        console.log(`  purchaseCount: ${purchaseCount} (should be === 1)`);
        
        console.log('✅ Fact evaluations:');
        console.log(`  eventType === "PURCHASE": ${eventType === "PURCHASE"}`);
        console.log(`  daysSinceFirstPurchase <= 60: ${daysSinceFirstPurchase <= 60}`);
        console.log(`  purchaseCount === 1: ${purchaseCount === 1}`);
        
      } else {
        console.log('❌ 2X Purchase rule NOT found in loaded rules');
        console.log('Available rules:', rules.map(r => r.name));
      }
    }
    
  } catch (error) {
    console.error('❌ Error processing event:', error);
  }
}

debugFullEngine().catch(console.error);
