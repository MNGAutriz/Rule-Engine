const { Engine } = require('json-rules-engine');
const FactsEngine = require('./engine/FactsEngine');

async function testFactEvaluation() {
  try {
    const engine = new Engine();
    const factsEngine = new FactsEngine();
    
    // Add facts to engine
    await factsEngine.addFactsToEngine(engine);
    
    const testData = {
      "eventId": "registration_test_001",
      "eventType": "INTERACTION",
      "timestamp": "2025-07-05T14:30:00Z",
      "market": "JP",
      "channel": "WEB",
      "productLine": "SKINCARE",
      "consumerId": "new_user_jp_001",
      "context": {
        "externalId": "reg_new_user_jp_001",
        "registrationSource": "website"
      },
      "attributes": {
        "email": "testuser@example.com"
      }
    };
    
    // Test individual facts
    console.log('=== TESTING FACTS INDIVIDUALLY ===');
    
    const eventTypeResult = await engine.run(testData, { facts: { eventType: testData.eventType } });
    console.log('eventType fact test:', testData.eventType);
    
    const marketResult = await engine.run(testData, { facts: { market: testData.market } });
    console.log('market fact test:', testData.market);
    
    // Test the problematic context.externalId fact
    console.log('context.externalId test:', testData.context?.externalId);
    
    // Add a simple rule to test if facts work
    const testRule = {
      conditions: {
        all: [
          { fact: 'eventType', operator: 'equal', value: 'INTERACTION' },
          { fact: 'market', operator: 'equal', value: 'JP' },
          { fact: 'context.externalId', operator: 'contains', value: 'reg' }
        ]
      },
      event: {
        type: 'TEST_REGISTRATION',
        params: { test: true }
      }
    };
    
    engine.addRule(testRule);
    
    console.log('\n=== TESTING FULL RULE ===');
    const results = await engine.run(testData);
    console.log('Rule test results:');
    console.log('Events triggered:', results.events.length);
    console.log('Events:', results.events);
    
  } catch (error) {
    console.error('Fact evaluation test failed:', error);
  }
}

testFactEvaluation();
