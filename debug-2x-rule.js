const LoyaltyEngine = require('./engine/LoyaltyEngine');
const consumerService = require('./services/consumerService');

async function debugRule() {
  const engine = new LoyaltyEngine();
  await engine.initializeEngine();
  
  const input = {
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
  
  console.log('=== BEFORE ENGINE RUN ===');
  console.log('user_003 purchase count:', consumerService.getPurchaseCount('user_003'));
  console.log('user_003 days since first purchase:', consumerService.getDaysSinceFirstPurchase('user_003'));
  
  // Create facts engine to test fact evaluation
  const facts = engine.factsEngine;
  
  console.log('\n=== TESTING FACT EVALUATION ===');
  
  // Test each fact individually
  const eventType = facts.factDefinitions.get('eventType')(input);
  console.log('eventType fact:', eventType);
  
  const market = facts.factDefinitions.get('market')(input);
  console.log('market fact:', market);
  
  const purchaseCount = await facts.factDefinitions.get('purchaseCount')(input);
  console.log('purchaseCount fact:', purchaseCount);
  
  const daysSinceFirstPurchase = await facts.factDefinitions.get('daysSinceFirstPurchase')(input);
  console.log('daysSinceFirstPurchase fact:', daysSinceFirstPurchase);
  
  console.log('\n=== RULE CONDITIONS ===');
  console.log('eventType === "PURCHASE":', eventType === 'PURCHASE');
  console.log('daysSinceFirstPurchase <= 60:', daysSinceFirstPurchase <= 60);
  console.log('purchaseCount === 1:', purchaseCount === 1);
  
  console.log('\n=== PROCESSING EVENT ===');
  const result = await engine.processEvent(input);
  console.log('Rules triggered:', result.pointBreakdown.map(rule => rule.ruleId));
}

debugRule().catch(console.error);
