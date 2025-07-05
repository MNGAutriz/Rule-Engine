/**
 * Simple Consultation Test
 */

const RulesEngine = require('./engine/RulesEngine');

async function testConsultation() {
  console.log('=== Testing CONSULTATION Event Only ===\n');
  
  const engine = new RulesEngine();
  await engine.initializeEngine();
  
  const consultationEvent = {
    eventId: 'evt_consultation_debug',
    eventType: 'CONSULTATION',
    timestamp: '2025-01-25T11:15:00Z',
    market: 'JP',
    channel: 'IN_STORE',
    productLine: 'SKINCARE',
    consumerId: 'consumer_debug',
    context: {
      storeId: 'STORE_TOKYO_001',
      consultantId: 'CONSULTANT_001'
    },
    attributes: {
      skinTestDate: '2025-01-25',
      consultationType: 'SKIN_ANALYSIS',
      duration: 30
    }
  };
  
  console.log('Testing consultation with event:', JSON.stringify(consultationEvent, null, 2));
  
  try {
    const result = await engine.processEvent(consultationEvent);
    console.log('\n✓ Consultation result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✗ Consultation error:', error.message);
  }
}

testConsultation().catch(console.error);
