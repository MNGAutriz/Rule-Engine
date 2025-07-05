const axios = require('axios');

async function testRegistrationDebug() {
  try {
    const registrationEvent = {
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
        "email": "testuser@example.com",
        "firstName": "Taro",
        "lastName": "Yamada"
      }
    };

    console.log('Testing registration with debug logging...');
    
    const response = await axios.post('http://localhost:3000/api/events/process', registrationEvent, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRegistrationDebug();
