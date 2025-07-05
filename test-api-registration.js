const axios = require('axios');

async function testRegistrationAPI() {
  try {
    console.log('Testing registration API...');
    
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
        "email": "testuser@example.com"
      }
    };

    console.log('Sending request to: http://localhost:3000/api/events/process');
    console.log('Event data:', JSON.stringify(registrationEvent, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/events/process', registrationEvent, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('\n✅ SUCCESS! Registration API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first with: node app.js');
    } else {
      console.error('❌ API Test failed:', error.response?.data || error.message);
    }
  }
}

testRegistrationAPI();
