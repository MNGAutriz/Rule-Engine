// Test purchase functionality with amount only
const axios = require('axios');

const testPurchase = async () => {
  const purchaseEvent = {
    eventId: `test_purchase_${Date.now()}`,
    eventType: "PURCHASE",
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
      amount: 2000,
      currency: "HKD",
      skuList: ["SK_HK_001", "SK_HK_002", "SK_HK_003"]
    }
  };

  try {
    console.log('Testing purchase event with amount only:', purchaseEvent);
    
    const response = await axios.post('http://localhost:3000/api/events/process', purchaseEvent);
    
    console.log('\n=== PURCHASE TEST RESULT ===');
    console.log('Status:', response.status);
    console.log('Consumer ID:', response.data.consumerId);
    console.log('Event Type:', response.data.eventType);
    console.log('Total Points Awarded:', response.data.totalPointsAwarded);
    console.log('Point Breakdown:', JSON.stringify(response.data.pointBreakdown, null, 2));
    console.log('Resulting Balance:', response.data.resultingBalance);
    console.log('Errors:', response.data.errors);
    
  } catch (error) {
    console.error('Error testing purchase:', error.response?.data || error.message);
  }
};

testPurchase();
