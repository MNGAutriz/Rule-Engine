const LoyaltyEngine = require('./engine/LoyaltyEngine');
const FactsEngine = require('./engine/FactsEngine');
const consumerService = require('./services/consumerService');

async function debugFacts() {
  console.log('🔍 Debugging Facts Computation...');
  
  const factEngine = new FactsEngine();
  
  // Test event data for 2X purchase in 60 days scenario
  const testInput = {
    "eventId": "evt_003",
    "eventType": "PURCHASE",
    "timestamp": "2025-06-10T15:00:00Z",
    "market": "JP",
    "channel": "WECHAT",
    "productLine": "PREMIUM_SERIES",
    "consumerId": "user_003",
    "context": {
      "externalId": "txn_500",
      "storeId": ""
    },
    "attributes": {
      "amount": 1000,
      "currency": "JPY"
    }
  };

  console.log('📋 Input Event:', JSON.stringify(testInput, null, 2));
  
  try {
    // Get consumer data
    const consumerData = await consumerService.getConsumerById(testInput.consumerId);
    console.log('👤 Consumer Data:', JSON.stringify(consumerData, null, 2));
    
    // Check specific facts by running them through the fact functions
    const facts = [
      'eventType',
      'market',
      'consumerId',
      'purchaseCount',
      'daysSinceFirstPurchase',
      'isFirstPurchase',
      'daysSinceLastPurchase',
      'eventDate'
    ];
    
    console.log('\n🔍 Facts Analysis:');
    for (const factName of facts) {
      try {
        const factFunction = factEngine.factDefinitions.get(factName);
        if (factFunction) {
          const value = await factFunction(testInput);
          console.log(`  ${factName}: ${value} (${typeof value})`);
        } else {
          console.log(`  ${factName}: NOT FOUND`);
        }
      } catch (error) {
        console.log(`  ${factName}: ERROR - ${error.message}`);
      }
    }
    
    // Test the 2X purchase rule conditions
    console.log('\n🧪 Testing 2X Purchase Rule Conditions:');
    const eventTypeFunc = factEngine.factDefinitions.get('eventType');
    const daysSinceFirstPurchaseFunc = factEngine.factDefinitions.get('daysSinceFirstPurchase');
    const purchaseCountFunc = factEngine.factDefinitions.get('purchaseCount');
    
    const eventType = await eventTypeFunc(testInput);
    const daysSinceFirstPurchase = await daysSinceFirstPurchaseFunc(testInput);
    const purchaseCount = await purchaseCountFunc(testInput);
    
    console.log(`  eventType === "PURCHASE": ${eventType === "PURCHASE"}`);
    console.log(`  daysSinceFirstPurchase <= 60: ${daysSinceFirstPurchase <= 60} (${daysSinceFirstPurchase})`);
    console.log(`  purchaseCount === 1: ${purchaseCount === 1} (${purchaseCount})`);
    
  } catch (error) {
    console.error('❌ Error debugging facts:', error);
  }
}

debugFacts().catch(console.error);
