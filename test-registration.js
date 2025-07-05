const axios = require('axios');

async function testRegistration() {
  try {
    const registrationEvent = {
      "eventId": "reg_test_001",
      "eventType": "INTERACTION",
      "timestamp": "2025-07-05T10:30:00Z",
      "market": "JP",
      "channel": "WEB",
      "productLine": "SKINCARE",
      "consumerId": "new_user_123",
      "context": {
        "externalId": "reg_new_user_123",
        "registrationSource": "website",
        "referralCode": "FRIEND2025"
      },
      "attributes": {
        "email": "newuser@example.com",
        "firstName": "Akira",
        "lastName": "Tanaka"
      }
    };

    console.log('Sending registration event:', JSON.stringify(registrationEvent, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/events/process', registrationEvent, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Registration test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.response?.data || error.message);
  }
}

testRegistration();
