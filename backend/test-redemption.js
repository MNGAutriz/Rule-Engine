// Test redemption functionality
const axios = require('axios');

const testRedemption = async () => {
  const redemptionEvent = {
    eventId: `test_redemption_${Date.now()}`,
    eventType: "REDEMPTION",
    timestamp: new Date().toISOString(),
    market: "HK",
    channel: "STORE",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_hk_standard",
    context: {
      storeId: "STORE_HK_001",
      campaignCode: "",
      adminId: "ADMIN_001"
    },
    attributes: {
      redemptionPoints: 500
    }
  };

  try {
    console.log('Testing redemption event:', redemptionEvent);
    
    const response = await axios.post('http://localhost:3000/api/events/process', redemptionEvent);
    
    console.log('\n=== REDEMPTION TEST RESULT ===');
    console.log('Status:', response.status);
    console.log('Consumer ID:', response.data.consumerId);
    console.log('Event Type:', response.data.eventType);
    console.log('Total Points Awarded:', response.data.totalPointsAwarded);
    console.log('Point Breakdown:', JSON.stringify(response.data.pointBreakdown, null, 2));
    console.log('Resulting Balance:', response.data.resultingBalance);
    console.log('Errors:', response.data.errors);
    
  } catch (error) {
    console.error('Error testing redemption:', error.response?.data || error.message);
  }
};

testRedemption();
