const { Engine } = require('json-rules-engine');

async function testBasicPattern() {
  try {
    const engine = new Engine();
    
    // Simple rule that should work
    const rule = {
      conditions: {
        all: [
          { fact: 'eventType', operator: 'equal', value: 'INTERACTION' }
        ]
      },
      event: {
        type: 'TEST_SUCCESS',
        params: { message: 'Basic rule worked!' }
      }
    };
    
    engine.addRule(rule);
    
    // The data passed to engine.run() should be available as facts
    const testData = {
      eventType: "INTERACTION"
    };
    
    console.log('=== Testing Basic Pattern ===');
    console.log('Test data:', testData);
    
    const results = await engine.run(testData);
    console.log('Results:');
    console.log('Events triggered:', results.events.length);
    console.log('Events:', results.events);
    
  } catch (error) {
    console.error('Basic test failed:', error);
  }
}

testBasicPattern();
