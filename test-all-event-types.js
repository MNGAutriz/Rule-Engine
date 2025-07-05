/**
 * Comprehensive Test for All Event Types
 * Tests the new business-friendly event structure with specific eventType values
 */

const RulesEngine = require('./engine/RulesEngine');

async function testAllEventTypes() {
  console.log('=== Testing All Event Types ===\n');
  
  const engine = new RulesEngine();
  await engine.initializeEngine();
  
  // Test 1: REGISTRATION event (JP market)
  console.log('1. Testing REGISTRATION event (JP):');
  const registrationEvent = {
    eventId: 'evt_reg_001',
    eventType: 'REGISTRATION',  // Direct eventType - no INTERACTION + context parsing
    timestamp: '2025-01-15T10:30:00Z',
    market: 'JP',
    channel: 'MOBILE_APP',
    productLine: 'SKINCARE',
    consumerId: 'consumer_12345',
    context: {
      storeId: 'STORE_TOKYO_001',
      campaignCode: 'WELCOME2025'
    },
    attributes: {
      signupMethod: 'EMAIL'
    }
  };
  
  try {
    const result = await engine.processEvent(registrationEvent);
    console.log('✓ Registration result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✗ Registration error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: PURCHASE event (JP market)
  console.log('2. Testing PURCHASE event (JP):');
  const purchaseEvent = {
    eventId: 'evt_purchase_001',
    eventType: 'PURCHASE',  // Direct eventType
    timestamp: '2025-01-16T14:20:00Z',  // Next day after registration
    market: 'JP',
    channel: 'ONLINE',
    productLine: 'SKINCARE',
    consumerId: 'consumer_12345',
    context: {
      storeId: 'STORE_TOKYO_001',
      orderId: 'ORDER_789'
    },
    attributes: {
      amount: 5000,  // 5000 JPY
      currency: 'JPY',
      srpAmount: 5000,
      skuList: ['SKU001', 'SKU002']
    }
  };
  
  try {
    const result = await engine.processEvent(purchaseEvent);
    console.log('✓ Purchase result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✗ Purchase error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: RECYCLE event
  console.log('3. Testing RECYCLE event:');
  const recycleEvent = {
    eventId: 'evt_recycle_001',
    eventType: 'RECYCLE',  // Direct eventType
    timestamp: '2025-01-20T16:45:00Z',
    market: 'JP',
    channel: 'IN_STORE',
    productLine: 'SKINCARE',
    consumerId: 'consumer_12345',
    context: {
      storeId: 'STORE_TOKYO_001',
      activityId: 'RECYCLE_001'
    },
    attributes: {
      recycledCount: 3,  // 3 bottles recycled
      bottleTypes: ['SERUM', 'CREAM', 'TONER']
    }
  };
  
  try {
    const result = await engine.processEvent(recycleEvent);
    console.log('✓ Recycle result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✗ Recycle error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: CONSULTATION event
  console.log('4. Testing CONSULTATION event:');
  const consultationEvent = {
    eventId: 'evt_consultation_001',
    eventType: 'CONSULTATION',  // Direct eventType
    timestamp: '2025-01-25T11:15:00Z',
    market: 'JP',
    channel: 'IN_STORE',
    productLine: 'SKINCARE',
    consumerId: 'consumer_12345',
    context: {
      storeId: 'STORE_TOKYO_001',
      consultantId: 'CONSULTANT_001'
    },
    attributes: {
      skinTestDate: '2025-01-25',
      consultationType: 'SKIN_ANALYSIS',
      duration: 30  // minutes
    }
  };
  
  try {
    const result = await engine.processEvent(consultationEvent);
    console.log('✓ Consultation result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✗ Consultation error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 5: ADJUSTMENT event
  console.log('5. Testing ADJUSTMENT event:');
  const adjustmentEvent = {
    eventId: 'evt_adjustment_001',
    eventType: 'ADJUSTMENT',  // Direct eventType
    timestamp: '2025-01-30T09:00:00Z',
    market: 'JP',
    channel: 'ADMIN',
    productLine: 'GENERAL',
    consumerId: 'consumer_12345',
    context: {
      adminId: 'ADMIN_001',
      reason: 'CUSTOMER_SERVICE_COMPENSATION'
    },
    attributes: {
      adjustedPoints: 200,
      note: 'Compensation for service issue'
    }
  };
  
  try {
    const result = await engine.processEvent(adjustmentEvent);
    console.log('✓ Adjustment result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✗ Adjustment error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 6: HK/TW PURCHASE event (different rules)
  console.log('6. Testing PURCHASE event (HK - different rules):');
  const hkPurchaseEvent = {
    eventId: 'evt_purchase_hk_001',
    eventType: 'PURCHASE',  // Direct eventType
    timestamp: '2025-01-15T14:20:00Z',
    market: 'HK',  // Different market
    channel: 'ONLINE',
    productLine: 'SKINCARE',
    consumerId: 'consumer_hk_456',
    context: {
      storeId: 'STORE_HK_001',
      orderId: 'ORDER_HK_789'
    },
    attributes: {
      amount: 800,  // 800 HKD
      currency: 'HKD',
      srpAmount: 800,
      skuList: ['SKU003', 'SKU004']
    }
  };
  
  try {
    const result = await engine.processEvent(hkPurchaseEvent);
    console.log('✓ HK Purchase result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✗ HK Purchase error:', error.message);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 All event type tests completed!');
  console.log('✅ Benefits of new structure:');
  console.log('   • Clear, business-friendly event types');
  console.log('   • No more vague INTERACTION + context parsing');
  console.log('   • Direct eventType matching in rules');
  console.log('   • Easy to understand and maintain');
  console.log('   • Better for business logic tracking');
  console.log('='.repeat(70));
}

// Run the test
testAllEventTypes().catch(console.error);
