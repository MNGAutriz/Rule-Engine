const RulesEngine = require('./engine/RulesEngine');

async function debugRegistration() {
  try {
    const engine = new RulesEngine();
    await engine.initializeEngine();
    
    const testEvent = {
      "eventId": "registration_test_001",
      "eventType": "INTERACTION",
      "timestamp": "2025-07-05T14:30:00Z",
      "market": "JP",
      "channel": "WEB",
      "productLine": "SKINCARE",
      "consumerId": "new_user_jp_001",
      "context": {
        "externalId": "reg_new_user_jp_001",
        "registrationSource": "website",
        "ipAddress": "192.168.1.100"
      },
      "attributes": {
        "email": "testuser@example.com",
        "firstName": "Taro",
        "lastName": "Yamada"
      }
    };

    console.log('=== DEBUG INFO ===');
    console.log('Test Event:', JSON.stringify(testEvent, null, 2));
    
    // Check available facts
    console.log('\nAvailable Facts:', engine.getEngineFacts());
    
    // Check engine stats
    console.log('\nEngine Stats:', engine.getEngineStats());
    
    console.log('\n=== PROCESSING EVENT ===');
    const result = await engine.processEvent(testEvent);
    
    console.log('\n=== RESULT ===');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugRegistration();
