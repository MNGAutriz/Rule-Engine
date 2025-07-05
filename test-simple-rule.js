const { Engine } = require('json-rules-engine');

async function testSimpleRule() {
  try {
    const engine = new Engine();
    
    // Add facts manually with detailed logging
    engine.addFact('eventType', (params) => {
      console.log('eventType - Full params object:', JSON.stringify(params, null, 2));
      return params.eventType;
    });
    
    engine.addFact('market', (params) => {
      console.log('market - Full params object:', JSON.stringify(params, null, 2));
      return params.market;
    });

    engine.addFact('context', (params) => {
      console.log('context - Full params object:', JSON.stringify(params, null, 2));
      return params.context || {};
    });
    
    // Try with a simpler fact name
    engine.addFact('externalId', (params) => {
      console.log('externalId - Full params object:', JSON.stringify(params, null, 2));
      return params.context?.externalId;
    });
    
    const testData = {
      "eventType": "INTERACTION",
      "market": "JP",
      "context": {
        "externalId": "reg_new_user_jp_001"
      }
    };
    
    // Add a simple rule with simpler fact name
    const testRule = {
      conditions: {
        all: [
          { fact: 'eventType', operator: 'equal', value: 'INTERACTION' },
          { fact: 'market', operator: 'equal', value: 'JP' },
          { fact: 'externalId', operator: 'contains', value: 'reg' }
        ]
      },
      event: {
        type: 'TEST_SUCCESS',
        params: { message: 'Rule worked!' }
      }
    };
    
    engine.addRule(testRule);
    
    console.log('=== TESTING SIMPLE RULE ===');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const results = await engine.run(testData);
    console.log('Results:');
    console.log('Events triggered:', results.events.length);
    console.log('Events:', results.events);
    console.log('Rule results:', results.ruleResults);
    
  } catch (error) {
    console.error('Simple rule test failed:', error);
  }
}

testSimpleRule();
