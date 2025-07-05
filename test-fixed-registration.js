const { Engine } = require('json-rules-engine');

async function testFixedRegistrationRule() {
  try {
    const engine = new Engine();
    
    // Add the nested fact for context.externalId
    engine.addFact('context.externalId', async (params, almanac) => {
      const context = await almanac.factValue('context');
      return context?.externalId;
    });
    
    // Test the fixed rule with regex operator
    const registrationRule = {
      conditions: {
        all: [
          { fact: 'eventType', operator: 'equal', value: 'INTERACTION' },
          { fact: 'market', operator: 'equal', value: 'JP' },
          { fact: 'context.externalId', operator: 'regex', value: '.*reg.*' }
        ]
      },
      event: {
        type: 'INTERACTION_REGISTRY_POINT',
        params: {
          registrationBonus: 150,
          description: 'JP registration bonus - 150 MD'
        }
      },
      priority: 10
    };
    
    engine.addRule(registrationRule);
    
    const testData = {
      eventType: "INTERACTION",
      market: "JP",
      context: {
        externalId: "reg_new_user_jp_001"
      }
    };
    
    console.log('=== Testing Fixed Registration Rule with Regex ===');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const results = await engine.run(testData);
    console.log('Results:');
    console.log('Events triggered:', results.events.length);
    console.log('Events:', results.events);
    
    if (results.events.length > 0) {
      console.log('🎉 SUCCESS! Registration rule is now working with regex operator!');
    } else {
      console.log('❌ Registration rule still not working');
    }
    
  } catch (error) {
    console.error('Registration rule test failed:', error);
  }
}

testFixedRegistrationRule();
