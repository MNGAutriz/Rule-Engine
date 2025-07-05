const { Engine } = require('json-rules-engine');

async function testRegistrationRule() {
  try {
    const engine = new Engine();
    
    // Add the nested fact for context.externalId with type checking
    engine.addFact('context.externalId', async (params, almanac) => {
      const context = await almanac.factValue('context');
      const result = context?.externalId;
      console.log('context.externalId fact returning:', result);
      console.log('Type of result:', typeof result);
      console.log('Is string?', typeof result === 'string');
      return result;
    });
    
    // Test with contains operator - let's see what's wrong
    const registrationRule = {
      conditions: {
        all: [
          { fact: 'eventType', operator: 'equal', value: 'INTERACTION' },
          { fact: 'market', operator: 'equal', value: 'JP' },
          { fact: 'context.externalId', operator: 'contains', value: 'reg' }
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
    
    // Let's also test a simple contains rule
    const simpleContainsRule = {
      conditions: {
        all: [
          { fact: 'context.externalId', operator: 'contains', value: 'user' }
        ]
      },
      event: {
        type: 'SIMPLE_CONTAINS_TEST',
        params: { message: 'Contains worked!' }
      }
    };
    
    engine.addRule(simpleContainsRule);
    
    engine.addRule(registrationRule);
    
    const testData = {
      eventType: "INTERACTION",
      market: "JP",
      context: {
        externalId: "reg_new_user_jp_001"
      }
    };
    
    console.log('=== Testing Registration Rule ===');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const results = await engine.run(testData);
    console.log('Results:');
    console.log('Events triggered:', results.events.length);
    console.log('Events:', results.events);
    
    if (results.events.length > 0) {
      console.log('✅ SUCCESS! Registration rule is working!');
    } else {
      console.log('❌ Registration rule did not trigger');
    }
    
  } catch (error) {
    console.error('Registration rule test failed:', error);
  }
}

testRegistrationRule();
