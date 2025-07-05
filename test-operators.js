const { Engine } = require('json-rules-engine');

async function testAvailableOperators() {
  try {
    const engine = new Engine();
    
    // Test different operators to see which ones work
    const operators = [
      'equal',
      'notEqual', 
      'contains',
      'doesNotContain',
      'in',
      'notIn',
      'greaterThan',
      'greaterThanInclusive',
      'lessThan',
      'lessThanInclusive',
      'regex'
    ];
    
    for (const operator of operators) {
      try {
        const rule = {
          conditions: {
            all: [{ fact: 'testValue', operator: operator, value: 'test' }]
          },
          event: { type: 'TEST', params: { operator: operator } }
        };
        
        engine.addRule(rule);
        console.log(`✅ ${operator} - supported`);
        engine.removeRule(rule);
        
      } catch (error) {
        console.log(`❌ ${operator} - NOT supported: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAvailableOperators();
