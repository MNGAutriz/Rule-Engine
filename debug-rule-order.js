const LoyaltyEngine = require('./engine/LoyaltyEngine');

async function debugRuleEvaluation() {
  console.log('🧪 Debugging Rule Evaluation Order...');
  
  // Reset events
  const fs = require('fs');
  fs.writeFileSync('data/events.json', '[]');
  
  const engine = new LoyaltyEngine();
  
  // Add debugging to see which rules are loaded
  await engine.initializeEngine();
  
  console.log('📊 Loaded Rules:');
  const rules = engine.engine.rules;
  const purchaseRules = rules.filter(rule => 
    rule.conditions.all?.some(cond => cond.fact === 'eventType' && cond.value === 'PURCHASE')
  );
  
  purchaseRules.forEach(rule => {
    console.log(`  - ${rule.name} (priority: ${rule.priority})`);
    rule.conditions.all?.forEach(cond => {
      console.log(`    ${cond.fact} ${cond.operator} ${cond.value}`);
    });
  });
  
  const testInput = {
    eventId: 'evt_test',
    eventType: 'PURCHASE',
    timestamp: '2025-06-18T12:00:00Z',
    market: 'HK',
    channel: 'LINE',
    productLine: 'PREMIUM_SERIES',
    consumerId: 'user_test',
    context: { externalId: 'test' },
    attributes: {
      srpAmount: 5500,
      currency: 'HKD'
    }
  };

  console.log('\n🎯 Processing test event...');
  const result = await engine.processEvent(testInput);
  
  console.log('\n📋 Results:');
  console.log('  Rules triggered:', result.pointBreakdown.length);
  result.pointBreakdown.forEach(item => {
    console.log(`  - ${item.ruleId}: ${item.points} points (${item.description})`);
  });
}

debugRuleEvaluation().catch(console.error);
