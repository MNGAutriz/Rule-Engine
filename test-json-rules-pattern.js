const { Engine } = require('json-rules-engine');

async function testJsonRulesEnginePattern() {
  try {
    const engine = new Engine();
    
    // This is the correct json-rules-engine pattern
    // Facts should be defined using direct property access
    engine.addFact('eventType', (params, almanac) => {
      // params is the fact parameters, almanac contains event data
      console.log('eventType fact - params:', params);
      console.log('eventType fact - almanac properties available:', Object.keys(almanac || {}));
      
      // Access through almanac runtime data
      return almanac.factValue('eventType');
    });
    
    console.log('=== Testing JSON Rules Engine pattern ===');
    
    const testData = {
      eventType: "INTERACTION",
      market: "JP",
      context: {
        externalId: "reg_new_user_jp_001"
      }
    };
    
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const results = await engine.run(testData);
    console.log('Results:', results);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testJsonRulesEnginePattern();
