const consumerService = require('./services/consumerService');

async function debugRedemption() {
  const consumerId = 'user_hk_standard';
  
  console.log('=== DEBUGGING REDEMPTION LOGIC ===');
  
  // Get current balance
  const currentBalance = await consumerService.getBalance(consumerId);
  console.log('1. Current balance:', currentBalance);
  
  // Simulate redemption calculation
  const totalRewardsAwarded = -500; // Negative for redemption
  console.log('2. Total rewards awarded:', totalRewardsAwarded);
  
  // Test the balance calculation logic
  let newTotal, newAvailable, newUsed;
  
  if (totalRewardsAwarded < 0) {
    // Redemption: deduct from available, add to used, keep total unchanged
    const redemptionAmount = Math.abs(totalRewardsAwarded);
    console.log('3. Redemption amount:', redemptionAmount);
    
    newTotal = currentBalance.total; // Total earned doesn't change
    newAvailable = Math.max(0, currentBalance.available - redemptionAmount);
    newUsed = currentBalance.used + redemptionAmount;
    
    console.log('4. Calculated new balance:');
    console.log('   newTotal:', newTotal);
    console.log('   newAvailable:', newAvailable);
    console.log('   newUsed:', newUsed);
  } else {
    // Normal earning: add to total and available
    newTotal = currentBalance.total + totalRewardsAwarded;
    newAvailable = currentBalance.available + totalRewardsAwarded;
    newUsed = currentBalance.used;
  }
  
  const newTransactionCount = (currentBalance.transactionCount || 0) + 1;
  
  console.log('5. Final balance to update:', { 
    total: newTotal, 
    available: newAvailable, 
    used: newUsed, 
    transactionCount: newTransactionCount 
  });
  
  // Actually update the balance
  const updatedBalance = await consumerService.updateBalance(consumerId, {
    total: newTotal,
    available: newAvailable,
    used: newUsed,
    transactionCount: newTransactionCount
  });
  
  console.log('6. Updated balance result:', updatedBalance);
  
  // Verify the update worked
  const verifyBalance = await consumerService.getBalance(consumerId);
  console.log('7. Verification - current balance after update:', verifyBalance);
}

debugRedemption().catch(console.error);
