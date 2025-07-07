const consumerService = require('./backend/services/consumerService');
const RulesEngine = require('./backend/engine/RulesEngine');

async function testRedemptionValidation() {
  console.log('=== Testing Redemption Validation ===');
  
  const rulesEngine = new RulesEngine();
  
  // Test data
  const testConsumerId = 'user_hk_standard';
  
  // Get current balance
  const currentBalance = consumerService.getBalance(testConsumerId);
  console.log(`Current balance for ${testConsumerId}:`, currentBalance);
  
  // Test case 1: Valid redemption (within available points)
  console.log('\n--- Test Case 1: Valid Redemption ---');
  const validRedemptionEvent = {
    eventId: 'test-redemption-valid',
    eventType: 'REDEMPTION',
    timestamp: new Date().toISOString(),
    market: 'HK',
    channel: 'STORE',
    consumerId: testConsumerId,
    context: { storeId: 'STORE_HK_001', campaignCode: '' },
    attributes: { redemptionPoints: Math.min(100, currentBalance.available) } // Use a small amount or available points
  };
  
  try {
    const result1 = await rulesEngine.processEvent(validRedemptionEvent);
    console.log('Valid redemption result:', {
      success: result1.errors.length === 0,
      errors: result1.errors,
      totalPointsAwarded: result1.totalPointsAwarded,
      resultingBalance: result1.resultingBalance
    });
  } catch (error) {
    console.error('Error processing valid redemption:', error.message);
  }
  
  // Test case 2: Invalid redemption (exceeds available points)
  console.log('\n--- Test Case 2: Invalid Redemption (Insufficient Points) ---');
  const invalidRedemptionEvent = {
    eventId: 'test-redemption-invalid',
    eventType: 'REDEMPTION',
    timestamp: new Date().toISOString(),
    market: 'HK',
    channel: 'STORE',
    consumerId: testConsumerId,
    context: { storeId: 'STORE_HK_001', campaignCode: '' },
    attributes: { redemptionPoints: currentBalance.available + 1000 } // Exceed available points
  };
  
  try {
    const result2 = await rulesEngine.processEvent(invalidRedemptionEvent);
    console.log('Invalid redemption result:', {
      success: result2.errors.length === 0,
      errors: result2.errors,
      totalPointsAwarded: result2.totalPointsAwarded,
      resultingBalance: result2.resultingBalance
    });
  } catch (error) {
    console.error('Error processing invalid redemption:', error.message);
  }
  
  // Final balance check
  const finalBalance = consumerService.getBalance(testConsumerId);
  console.log(`\nFinal balance for ${testConsumerId}:`, finalBalance);
}

// Run the test
testRedemptionValidation().catch(console.error);
