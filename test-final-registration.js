const { Engine } = require('json-rules-engine');

async function testFixedRegistration() {
  try {
    const engine = new Engine();
    
    // Add the custom fact for registration interaction detection
    engine.addFact('isRegistrationInteraction', async (params, almanac) => {
      const context = await almanac.factValue('context');
      const externalId = context?.externalId || '';
      console.log('Checking if registration interaction - externalId:', externalId, 'contains reg:', externalId.includes('reg'));
      return externalId.includes('reg');
    });
    
    // Test the fixed rule with boolean fact
    const registrationRule = {
      conditions: {
        all: [
          { fact: 'eventType', operator: 'equal', value: 'INTERACTION' },
          { fact: 'market', operator: 'equal', value: 'JP' },
          { fact: 'isRegistrationInteraction', operator: 'equal', value: true }
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
    
    console.log('=== Testing Fixed Registration Rule ===');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const results = await engine.run(testData);
    console.log('Results:');
    console.log('Events triggered:', results.events.length);
    console.log('Events:', results.events);
    
    if (results.events.length > 0) {
      console.log('🎉 SUCCESS! Registration rule is now working!');
    } else {
      console.log('❌ Registration rule still not working');
    }
    
  } catch (error) {
    console.error('Registration rule test failed:', error);
  }
}

testFixedRegistration();
