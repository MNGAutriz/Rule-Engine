const { Engine } = require('json-rules-engine');

async function testContainsOperator() {
  try {
    const engine = new Engine();
    
    // Test different contains patterns
    const testCases = [
      {
        name: 'String contains test',
        rule: {
          conditions: {
            all: [{ fact: 'testString', operator: 'contains', value: 'reg' }]
          },
          event: { type: 'STRING_CONTAINS', params: { test: 'string contains' } }
        },
        data: { testString: 'reg_new_user_jp_001' }
      },
      {
        name: 'Array contains test',
        rule: {
          conditions: {
            all: [{ fact: 'testArray', operator: 'contains', value: 'reg' }]
          },
          event: { type: 'ARRAY_CONTAINS', params: { test: 'array contains' } }
        },
        data: { testArray: ['reg', 'new', 'user'] }
      },
      {
        name: 'String regex test',
        rule: {
          conditions: {
            all: [{ fact: 'testString', operator: 'regex', value: '.*reg.*' }]
          },
          event: { type: 'STRING_REGEX', params: { test: 'string regex' } }
        },
        data: { testString: 'reg_new_user_jp_001' }
      }
    ];
    
    for (const testCase of testCases) {
      engine.addRule(testCase.rule);
      
      console.log(`\n=== ${testCase.name} ===`);
      console.log('Data:', testCase.data);
      
      const results = await engine.run(testCase.data);
      console.log('Events triggered:', results.events.length);
      console.log('Events:', results.events.map(e => e.type));
      
      // Remove rule for next test
      engine.removeRule(testCase.rule);
    }
    
  } catch (error) {
    console.error('Contains operator test failed:', error);
  }
}

testContainsOperator();
