const { Engine } = require('json-rules-engine');

async function testCampaignRuleDirectly() {
  console.log('🧪 Testing Campaign Rule Directly...\n');
  
  // Create a fresh engine instance
  const engine = new Engine();
  
  // Add minimal facts needed for the campaign rule
  engine.addFact('eventType', (params) => params.eventType);
  engine.addFact('market', (params) => params.market);
  engine.addFact('eventDate', (params) => {
    console.log('DEBUG: eventDate fact called with params:', params);
    console.log('DEBUG: params.timestamp:', params.timestamp);
    console.log('DEBUG: typeof params.timestamp:', typeof params.timestamp);
    
    if (!params.timestamp) {
      console.log('DEBUG: No timestamp found, returning default date');
      return '2025-06-15'; // Default for debugging
    }
    
    try {
      const date = new Date(params.timestamp);
      console.log('DEBUG: Created Date object:', date);
      const isoString = date.toISOString();
      console.log('DEBUG: ISO string:', isoString);
      const dateOnly = isoString.substr(0, 10);
      console.log('DEBUG: Date only:', dateOnly);
      return dateOnly;
    } catch (error) {
      console.log('DEBUG: Error in eventDate fact:', error);
      return '2025-06-15'; // Fallback
    }
  });
  
  // Add the campaign rule directly
  const campaignRule = {
    "name": "Campaign Period Bonus",
    "conditions": {
      "all": [
        { "fact": "eventType", "operator": "equal", "value": "PURCHASE" },
        { "fact": "eventDate", "operator": "greaterThanInclusive", "value": "2025-06-01" },
        { "fact": "eventDate", "operator": "lessThanInclusive", "value": "2025-07-15" },
        { "fact": "market", "operator": "equal", "value": "HK" }
      ]
    },
    "event": {
      "type": "FLEXIBLE_CAMPAIGN_BONUS",
      "params": {
        "fixedBonus": 300,
        "description": "Campaign bonus: CAMP2025SUMMER"
      }
    },
    "priority": 3
  };
  
  engine.addRule(campaignRule);
  
  // Add success handler
  engine.on('success', (event, almanac, ruleResult) => {
    console.log(`✅ Rule triggered: ${event.type}`, {
      params: event.params,
      rule: ruleResult?.rule?.name || ruleResult?.name || 'Unnamed rule'
    });
  });
  
  // Test data
  const testEvent = {
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
  
  console.log('Test event data:');
  console.log('- eventType:', testEvent.eventType);
  console.log('- market:', testEvent.market);
  console.log('- timestamp:', testEvent.timestamp);
  console.log('- eventDate (calculated):', new Date(testEvent.timestamp).toISOString().substr(0, 10));
  
  console.log('\n=== RUNNING ENGINE ===');
  try {
    const results = await engine.run(testEvent);
    console.log('Engine results:', results);
    console.log('Events triggered:', results.events.length);
    if (results.events.length > 0) {
      results.events.forEach(event => {
        console.log('- Event type:', event.type);
        console.log('- Event params:', event.params);
      });
    } else {
      console.log('❌ No rules triggered');
    }
  } catch (error) {
    console.error('Error running engine:', error);
  }
}

testCampaignRuleDirectly().catch(console.error);
