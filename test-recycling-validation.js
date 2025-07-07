const consumerService = require('./backend/services/consumerService');
const RulesEngine = require('./backend/engine/RulesEngine');

async function testRecyclingValidation() {
  console.log('=== Testing Recycling Validation ===');
  
  const rulesEngine = new RulesEngine();
  
  // Test data
  const testConsumerId = 'user_hk_standard';
  
  // Get current user data to check recycling activity
  const user = consumerService.getConsumerById(testConsumerId);
  console.log(`Current recycling data for ${testConsumerId}:`, user.engagement?.recyclingActivity);
  
  // Test case 1: Valid recycling (within yearly limits)
  console.log('\n--- Test Case 1: Valid Recycling ---');
  const validRecyclingEvent = {
    eventId: 'test-recycling-valid',
    eventType: 'RECYCLE',
    timestamp: new Date().toISOString(),
    market: 'HK',
    channel: 'STORE',
    consumerId: testConsumerId,
    context: { storeId: 'STORE_HK_001', campaignCode: '' },
    attributes: { recycledCount: 1 } // Safe amount
  };
  
  try {
    const result1 = await rulesEngine.processEvent(validRecyclingEvent);
    console.log('Valid recycling result:', {
      success: result1.errors.length === 0,
      errors: result1.errors,
      totalPointsAwarded: result1.totalPointsAwarded,
      resultingBalance: result1.resultingBalance
    });
  } catch (error) {
    console.error('Error processing valid recycling:', error.message);
  }
  
  // Test case 2: Invalid recycling (exceeds yearly limits)
  console.log('\n--- Test Case 2: Invalid Recycling (Exceeds Yearly Limit) ---');
  const invalidRecyclingEvent = {
    eventId: 'test-recycling-invalid',
    eventType: 'RECYCLE',
    timestamp: new Date().toISOString(),
    market: 'HK',
    channel: 'STORE',
    consumerId: testConsumerId,
    context: { storeId: 'STORE_HK_001', campaignCode: '' },
    attributes: { recycledCount: 10 } // Exceeds limit of 5 per year
  };
  
  try {
    const result2 = await rulesEngine.processEvent(invalidRecyclingEvent);
    console.log('Invalid recycling result:', {
      success: result2.errors.length === 0,
      errors: result2.errors,
      totalPointsAwarded: result2.totalPointsAwarded,
      resultingBalance: result2.resultingBalance
    });
  } catch (error) {
    console.error('Error processing invalid recycling:', error.message);
  }
  
  // Test case 3: Edge case - exactly at the limit
  console.log('\n--- Test Case 3: Edge Case (At Limit) ---');
  const currentRecycled = user.engagement?.recyclingActivity?.thisYearBottlesRecycled || 0;
  const maxAllowed = 5;
  const remainingSlots = Math.max(0, maxAllowed - currentRecycled);
  
  if (remainingSlots > 0) {
    const edgeCaseEvent = {
      eventId: 'test-recycling-edge',
      eventType: 'RECYCLE',
      timestamp: new Date().toISOString(),
      market: 'HK',
      channel: 'STORE',
      consumerId: testConsumerId,
      context: { storeId: 'STORE_HK_001', campaignCode: '' },
      attributes: { recycledCount: remainingSlots } // Exactly fill remaining slots
    };
    
    try {
      const result3 = await rulesEngine.processEvent(edgeCaseEvent);
      console.log('Edge case recycling result:', {
        success: result3.errors.length === 0,
        errors: result3.errors,
        totalPointsAwarded: result3.totalPointsAwarded,
        resultingBalance: result3.resultingBalance
      });
    } catch (error) {
      console.error('Error processing edge case recycling:', error.message);
    }
  } else {
    console.log('User has already reached the yearly limit. Cannot test edge case.');
  }
  
  // Final user data check
  const finalUser = consumerService.getConsumerById(testConsumerId);
  console.log(`\nFinal recycling data for ${testConsumerId}:`, finalUser.engagement?.recyclingActivity);
}

// Run the test
testRecyclingValidation().catch(console.error);
