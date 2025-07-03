const { Engine } = require('json-rules-engine');

async function testBasketRuleDirect() {
  console.log('🧪 Testing Basket Rule Directly...');
  
  const engine = new Engine();
  
  // Add the basket threshold rule directly
  const rule = {
    name: 'High Value Basket Bonus - HKD 5000',
    conditions: {
      all: [
        { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
        { fact: 'market', operator: 'equal', value: 'HK' },
        { fact: 'attributes.srpAmount', operator: 'greaterThanInclusive', value: 5000 }
      ]
    },
    event: {
      type: 'FLEXIBLE_BASKET_AMOUNT',
      params: {
        threshold: 5000,
        bonus: 200,
        description: 'Bonus for spending over HKD 5000 SRP'
      }
    },
    priority: 4
  };
  
  engine.addRule(rule);
  
  // Add simple facts
  engine.addFact('eventType', 'PURCHASE');
  engine.addFact('market', 'HK');
  engine.addFact('attributes.srpAmount', 5500);
  
  console.log('📋 Rule conditions:');
  console.log('  eventType: PURCHASE');
  console.log('  market: HK');
  console.log('  attributes.srpAmount: 5500');
  
  try {
    const results = await engine.run();
    console.log('✅ Rule engine results:');
    console.log('  Events triggered:', results.events.length);
    console.log('  Events:', results.events);
    
    if (results.events.length > 0) {
      console.log('✅ Basket rule triggered successfully!');
    } else {
      console.log('❌ Basket rule did not trigger');
    }
  } catch (error) {
    console.error('❌ Error running rule:', error);
  }
}

testBasketRuleDirect().catch(console.error);
