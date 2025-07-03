const LoyaltyEngine = require('./engine/LoyaltyEngine');

async function debugCampaignRule() {
  console.log('🧪 Debugging Campaign Rule...\n');
  
  const engine = new LoyaltyEngine();
  await engine.initializeEngine();
  
  const input = {
    "eventId": "evt_004",
    "eventType": "PURCHASE",
    "timestamp": "2025-06-15T14:00:00Z",
    "market": "HK",
    "channel": "LINE",
    "productLine": "PREMIUM_SERIES",
    "consumerId": "user_004",
    "context": {
      "externalId": "txn_912",
      "storeId": ""
    },
    "attributes": {
      "amount": 1000,
      "currency": "HKD"
    }
  };
  
  console.log('=== TESTING FACT EVALUATION ===');
  
  // Test each fact individually
  const facts = engine.factsEngine;
  
  const eventType = facts.factDefinitions.get('eventType')(input);
  console.log('eventType fact:', eventType);
  
  const market = facts.factDefinitions.get('market')(input);
  console.log('market fact:', market);
  
  const eventDate = facts.factDefinitions.get('eventDate')(input);
  console.log('eventDate fact:', eventDate);
  console.log('eventDate type:', typeof eventDate);
  
  console.log('\n=== RULE CONDITIONS ===');
  console.log('eventType === "PURCHASE":', eventType === 'PURCHASE');
  console.log('market === "HK":', market === 'HK');
  console.log('eventDate >= "2025-06-01":', eventDate >= "2025-06-01");
  console.log('eventDate <= "2025-07-15":', eventDate <= "2025-07-15");
  
  // String date comparison should work now
  console.log('eventDate value:', eventDate);
  console.log('String comparison >= "2025-06-01":', eventDate >= "2025-06-01");
  console.log('String comparison <= "2025-07-15":', eventDate <= "2025-07-15");
  
  console.log('\n=== PROCESSING EVENT ===');
  const result = await engine.processEvent(input);
  console.log('Rules triggered:', result.pointBreakdown.map(rule => rule.ruleId));
}

debugCampaignRule().catch(console.error);
