/**
 * Consumer Data Platform (CDP) Service
 * Handles all consumer profile data, attributes calculation, and business logic
 * Simulates a real CDP that would contain rich consumer behavioral data
 */
class CDPService {
  
  /**
   * Get enriched consumer data from CDP with calculated attributes
   * This simulates a real CDP API that would return comprehensive consumer profiles
   */
  static async getEnrichedConsumerData(consumerId) {
    const consumerService = require('./consumerService');
    
    try {
      // Get base consumer data from CDP
      const baseConsumerData = await consumerService.getConsumerById(consumerId);
      
      if (!baseConsumerData) {
        throw new Error(`Consumer ${consumerId} not found in CDP`);
      }

      // Calculate derived attributes using business logic
      const enrichedData = {
        consumerId: baseConsumerData.consumerId,
        profile: baseConsumerData.profile,
        engagement: baseConsumerData.engagement,
        preferences: baseConsumerData.preferences,
        balance: baseConsumerData.balance,
        
        // Calculated attributes (not stored, but derived)
        calculatedAttributes: {
          isVIP: this.calculateVIPStatus(baseConsumerData),
          isBirthMonth: this.calculateIsBirthMonth(baseConsumerData),
          tierLevel: this.calculateTierLevel(baseConsumerData),
          recyclingEligibility: this.calculateRecyclingEligibility(baseConsumerData),
          loyaltySegment: this.calculateLoyaltySegment(baseConsumerData),
          lifetimeValue: this.calculateLifetimeValue(baseConsumerData)
        }
      };

      console.log(`CDP: Enriched data for ${consumerId}:`, {
        tier: enrichedData.profile.tier,
        isVIP: enrichedData.calculatedAttributes.isVIP,
        isBirthMonth: enrichedData.calculatedAttributes.isBirthMonth,
        recyclingBottles: enrichedData.engagement?.recyclingActivity?.thisYearBottlesRecycled || 0
      });

      return enrichedData;
      
    } catch (error) {
      console.error('CDP Service Error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate VIP status based on tier and engagement metrics
   * Business logic: VIP if tier contains "VIP" or meets spending thresholds
   */
  static calculateVIPStatus(consumerData) {
    const tier = consumerData.profile?.tier || 'STANDARD';
    const engagement = consumerData.engagement || {};
    const totalSpent = engagement.totalSpent || 0;
    const totalPurchases = engagement.totalPurchases || 0;
    
    // VIP if explicitly in VIP tier
    if (tier.includes('VIP')) {
      return true;
    }
    
    // VIP if meets spending and frequency thresholds
    if (totalSpent >= 20000 && totalPurchases >= 10) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate if current month is consumer's birth month
   * Business logic: Compare current month with birth month from birthDate
   */
  static calculateIsBirthMonth(consumerData) {
    const birthDate = consumerData.profile?.birthDate;
    
    if (!birthDate) {
      return false;
    }
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    
    const birthDateObj = new Date(birthDate);
    const birthMonth = birthDateObj.getMonth() + 1;
    
    return currentMonth === birthMonth;
  }

  /**
   * Calculate tier level for multiplier calculations
   * Business logic: Convert tier names to numeric levels
   */
  static calculateTierLevel(consumerData) {
    const tier = consumerData.profile?.tier || 'STANDARD';
    
    const tierLevels = {
      'STANDARD': 1,
      'VIP_SILVER': 2,
      'VIP_GOLD': 3,
      'VIP_PLATINUM': 4
    };
    
    return tierLevels[tier] || 1;
  }

  /**
   * Calculate recycling eligibility and current year count
   * Business logic: Check recycling activity within limits
   */
  static calculateRecyclingEligibility(consumerData) {
    const recyclingActivity = consumerData.engagement?.recyclingActivity;
    
    if (!recyclingActivity) {
      return {
        isEligible: false,
        remainingBottles: 0,
        thisYearCount: 0
      };
    }
    
    const maxBottlesPerYear = 5; // From rules
    const thisYearCount = recyclingActivity.thisYearBottlesRecycled || 0;
    const remainingBottles = Math.max(0, maxBottlesPerYear - thisYearCount);
    
    return {
      isEligible: remainingBottles > 0,
      remainingBottles: remainingBottles,
      thisYearCount: thisYearCount
    };
  }

  /**
   * Calculate loyalty segment for marketing purposes
   * Business logic: Segment based on engagement patterns
   */
  static calculateLoyaltySegment(consumerData) {
    const totalSpent = consumerData.engagement?.totalSpent || 0;
    const totalPurchases = consumerData.engagement?.totalPurchases || 0;
    const consultations = consumerData.engagement?.consultationsCompleted || 0;
    
    if (totalSpent >= 50000 && totalPurchases >= 20) {
      return 'CHAMPION';
    } else if (totalSpent >= 20000 && totalPurchases >= 10) {
      return 'LOYAL_CUSTOMER';
    } else if (consultations >= 2) {
      return 'ENGAGED_CUSTOMER';
    } else if (totalPurchases >= 5) {
      return 'REGULAR_CUSTOMER';
    } else {
      return 'NEW_CUSTOMER';
    }
  }

  /**
   * Calculate lifetime value score
   * Business logic: Weighted score based on multiple factors
   */
  static calculateLifetimeValue(consumerData) {
    const engagement = consumerData.engagement || {};
    const totalSpent = engagement.totalSpent || 0;
    const totalPurchases = engagement.totalPurchases || 0;
    const consultations = engagement.consultationsCompleted || 0;
    const recycling = engagement.recyclingActivity?.totalBottlesRecycled || 0;
    
    // Weighted calculation
    const spendingScore = totalSpent * 0.4;
    const frequencyScore = totalPurchases * 100;
    const engagementScore = consultations * 200;
    const sustainabilityScore = recycling * 50;
    
    return Math.round(spendingScore + frequencyScore + engagementScore + sustainabilityScore);
  }

  /**
   * Get consumer attributes optimized for rules engine
   * Returns flat structure for easy rule condition matching
   */
  static async getConsumerAttributesForRules(consumerId) {
    const enrichedData = await this.getEnrichedConsumerData(consumerId);
    
    // Flatten for rules engine compatibility
    return {
      // Direct attributes
      market: enrichedData.profile.market,
      tier: enrichedData.profile.tier,
      preferredChannel: enrichedData.profile.preferredChannel,
      
      // Calculated boolean attributes
      isVIP: enrichedData.calculatedAttributes.isVIP,
      isBirthMonth: enrichedData.calculatedAttributes.isBirthMonth,
      
      // Engagement metrics (with safe defaults)
      totalPurchases: enrichedData.engagement?.totalPurchases || 0,
      totalSpent: enrichedData.engagement?.totalSpent || 0,
      consultationsCompleted: enrichedData.engagement?.consultationsCompleted || 0,
      
      // Recycling data
      recycledCount: enrichedData.engagement?.recyclingActivity?.thisYearBottlesRecycled || 0,
      recyclingEligible: enrichedData.calculatedAttributes.recyclingEligibility.isEligible,
      
      // Segmentation
      loyaltySegment: enrichedData.calculatedAttributes.loyaltySegment,
      tierLevel: enrichedData.calculatedAttributes.tierLevel,
      lifetimeValue: enrichedData.calculatedAttributes.lifetimeValue
    };
  }
}

module.exports = CDPService;
