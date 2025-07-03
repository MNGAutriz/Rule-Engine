const { Engine } = require('json-rules-engine');

async function testRuleDirectly() {
  console.log('🧪 Testing 2X Purchase Rule Directly...');
  
  // Create a simple engine to test the rule
  const engine = new Engine();
  
  // Add the 2X Purchase rule
  const rule = {
    "name": "Second Purchase Within 60 Days",
    "conditions": {
      "all": [
        { "fact": "eventType", "operator": "equal", "value": "PURCHASE" },
        { "fact": "daysSinceFirstPurchase", "operator": "lessThanInclusive", "value": 60 },
        { "fact": "purchaseCount", "operator": "equal", "value": 1 }
      ]
    },
    "event": {
      "type": "ORDER_MULTIPLE_POINT",
      "params": {
        "multiplier": 2.0,
        "description": "2X Purchase Bonus within 60 days"
      }
    },
    "priority": 6
  };
  
  engine.addRule(rule);
  
  // Add basic facts
  engine.addFact('eventType', 'PURCHASE');
  engine.addFact('daysSinceFirstPurchase', 32);
  engine.addFact('purchaseCount', 1);
  
  console.log('📋 Rule conditions:');
  console.log('  eventType: PURCHASE');
  console.log('  daysSinceFirstPurchase: 32 (should be <= 60)');
  console.log('  purchaseCount: 1 (should be === 1)');
  
  try {
    const results = await engine.run();
    console.log('✅ Rule engine results:');
    console.log('  Events triggered:', results.events.length);
    console.log('  Events:', results.events);
    
    if (results.events.length > 0) {
      console.log('✅ Rule triggered successfully!');
    } else {
      console.log('❌ Rule did not trigger');
    }
  } catch (error) {
    console.error('❌ Error running rule:', error);
  }
}

testRuleDirectly().catch(console.error);
