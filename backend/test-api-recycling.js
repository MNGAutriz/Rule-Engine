// Test recycling event through API
const axios = require('axios');

async function testRecyclingAPI() {
  console.log('🧪 Testing RECYCLE event through API...\n');

  const recycleEvent = {
    eventId: 'test_recycle_api_001',
    eventType: 'RECYCLE',
    timestamp: new Date().toISOString(),
    market: 'HK',
    channel: 'STORE',
    consumerId: 'user_hk_standard',
    context: {
      storeId: 'STORE_HK_001'
    },
    attributes: {
      recycledCount: 2
    }
  };

  try {
    console.log('📊 Sending recycling event to API:', JSON.stringify(recycleEvent, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/events/process', recycleEvent);
    
    console.log('\n✅ RECYCLE event processed successfully!');
    console.log('📈 API response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.data?.details) {
      console.error('Error details:', error.response.data.details);
    }
  }
}

// Run the test
testRecyclingAPI().catch(error => {
  console.error('\n❌ Test error:', error.message);
});
