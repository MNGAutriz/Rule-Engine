/**
 * Calculation Helpers - Contains all reward calculation methods
 * Market-agnostic calculation logic for different event types
 */
class CalculationHelpers {
  
  /**
   * Calculate registration reward based on market and parameters
   */
  static calculateRegistrationReward(market, params) {
    return Math.floor(params.registrationBonus || params.bonus || params.reward || 0);
  }

  /**
   * Calculate base purchase reward
   */
  static calculateBaseReward(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    
    // Some markets use lower conversion rates (e.g., 1 MD per 10 currency units)
    if (market === 'JP') {
      const conversionRate = params.conversionRate || params.tenthsRate || params.rate || 0.1;
      return Math.floor(calculationAmount * conversionRate);
    }
    
    // Other markets typically use 1:1 ratio on SRP
    const rate = params.rate || params.standardRate || 1.0;
    return Math.floor(calculationAmount * rate);
  }

  /**
   * Calculate multiplier-based rewards (for repeat purchases, etc.)
   */
  static calculateMultiplierReward(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    
    // Some markets use lower conversion rates (1 MD per 10 currency units), others use 1:1
    let baseRate;
    if (market === 'JP') {
      baseRate = params.conversionRate || params.tenthsRate || params.baseRate || 0.1;
    } else {
      baseRate = params.rate || params.standardRate || params.baseRate || 1.0;
    }
    
    const multiplier = params.multiplier || 1.0;
    const baseReward = Math.floor(calculationAmount * baseRate);
    
    // Apply multiplier and subtract base to get bonus only
    return Math.floor(baseReward * multiplier) - baseReward;
  }

  /**
   * Calculate campaign-specific rewards
   */
  static calculateCampaignReward(market, baseAmount, discountedAmount, params) {
    // Fixed bonus campaigns
    if (params.fixedBonus || params.bonus) {
      return Math.floor(params.fixedBonus || params.bonus);
    }
    
    // Multiplier-based campaigns
    if (params.multiplier) {
      return this.calculateMultiplierReward(market, baseAmount, discountedAmount, params);
    }
    
    // Rate-based campaigns
    const calculationAmount = discountedAmount || baseAmount;
    const campaignRate = params.campaignRate || params.rate || 0;
    return Math.floor(calculationAmount * campaignRate);
  }

  /**
   * Calculate tier/VIP multiplier rewards
   * This should multiply ALL previous points earned (base + campaign bonuses)
   */
  static calculateTierMultiplier(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    
    // Calculate base purchase points
    let baseRate;
    if (market === 'JP') {
      baseRate = params.conversionRate || params.tenthsRate || params.baseRate || 0.1;
    } else {
      baseRate = params.rate || params.standardRate || params.baseRate || 1.0;
    }
    
    const baseReward = Math.floor(calculationAmount * baseRate);
    const multiplier = params.multiplier || 1.0;
    
    // For VIP multiplier, we need to apply it to base + campaign bonus
    // Since campaign bonus is fixed (300) for HK/TW, add it here
    let campaignBonus = 0;
    if (market === 'HK' || market === 'TW') {
      campaignBonus = 300; // Fixed campaign bonus
    }
    
    const totalEarned = baseReward + campaignBonus;
    
    // Return the bonus amount (multiplied total minus original total)
    return Math.floor(totalEarned * (multiplier - 1.0));
  }

  /**
   * Calculate threshold-based rewards (basket amount bonuses)
   */
  static calculateThresholdReward(market, amount, params) {
    const threshold = params.threshold || 0;
    const bonus = params.bonus || params.reward || 0;
    
    return amount >= threshold ? Math.floor(bonus) : 0;
  }

  /**
   * Calculate product-specific rewards
   * Apply multiplier to base purchase amount to get bonus points
   */
  static calculateProductReward(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    
    // Fixed bonus for specific products
    if (params.fixedBonus || params.bonus) {
      return Math.floor(params.fixedBonus || params.bonus);
    }
    
    // Multiplier-based product rewards
    // Some markets use lower conversion rates (1 MD per 10 currency units), others use 1:1
    let baseRate;
    if (market === 'JP') {
      baseRate = params.conversionRate || params.tenthsRate || params.baseRate || 0.1;
    } else {
      baseRate = params.rate || params.standardRate || params.baseRate || 1.0;
    }
    
    const multiplier = params.multiplier || 1.0;
    const baseReward = Math.floor(calculationAmount * baseRate);
    
    // Return the additional points from the multiplier (bonus only, not total)
    return Math.floor(baseReward * (multiplier - 1.0));
  }

  /**
   * Calculate combo/bundle rewards
   */
  static calculateComboReward(market, params) {
    return Math.floor(params.bonus || params.reward || params.fixedBonus || 0);
  }

  /**
   * Calculate activity-based rewards (recycling, engagement)
   */
  static calculateActivityReward(market, itemCount, params) {
    const maxItemsPerPeriod = params.maxPerYear || params.maxPerPeriod || itemCount;
    const rewardPerItem = params.pointsPerBottle || params.rewardPerItem || params.rewardPerActivity || 0;
    const actualCount = Math.min(itemCount, maxItemsPerPeriod);
    return Math.floor(actualCount * rewardPerItem);
  }

  /**
   * Calculate skin test and time-limited rewards
   */
  static calculateSkinTestReward(market, params) {
    // In a real implementation, we'd check if the skin test is within the allowed timeframe
    // For now, just return the bonus if skinTestBonus is defined
    return Math.floor(params.skinTestBonus || 0);
  }

  /**
   * Calculate consultation rewards (simpler than skin test)
   */
  static calculateConsultationReward(market, params) {
    return Math.floor(params.consultationBonus || 0);
  }

  /**
   * Calculate timed bonuses (birth month, anniversaries)
   */
  static calculateTimedBonus(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    
    // Some markets use lower conversion rates (1 MD per 10 currency units), others use 1:1
    let baseRate;
    if (market === 'JP') {
      baseRate = params.conversionRate || params.tenthsRate || params.baseRate || 0.1;
    } else {
      baseRate = params.rate || params.standardRate || params.baseRate || 1.0;
    }
    
    const baseReward = Math.floor(calculationAmount * baseRate);
    const multiplier = params.multiplier || 1.0;
    return Math.floor(baseReward * (multiplier - 1.0));
  }

  /**
   * Calculate redemption points (negative points to deduct from balance)
   * Redemption is basically a deduction of points from the user's balance
   */
  static calculateRedemptionDeduction(market, redemptionPoints, params) {
    // Redemption should always be negative to deduct from balance
    const pointsToRedeem = Math.abs(redemptionPoints || params.redemptionPoints || 0);
    return -pointsToRedeem; // Return negative value to deduct from balance
  }
}

module.exports = CalculationHelpers;
