const LoyaltyEngine = require('./engine/LoyaltyEngine');

async function testCampaign() {
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

  const engine = new LoyaltyEngine();
  const result = await engine.processEvent(input);
  
  console.log('✅ Campaign test result:');
  console.log('Rules triggered:', result.pointBreakdown.map(r => r.ruleId).join(', '));
  console.log('Total points:', result.totalPointsAwarded);
  console.log('Has FLEXIBLE_CAMPAIGN_BONUS:', result.pointBreakdown.some(r => r.ruleId === 'FLEXIBLE_CAMPAIGN_BONUS'));
}

testCampaign().catch(console.error);
