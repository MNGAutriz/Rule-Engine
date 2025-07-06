/**
 * Formatting Helpers - Contains all response formatting and description methods
 * Handles user-friendly descriptions, rule categorization, and response structure
 */
class FormattingHelpers {

  /**
   * Get rule category for better organization in responses
   */
  static getRuleCategory(ruleId) {
    const categories = {
      'INTERACTION_REGISTRY_POINT': 'REGISTRATION',
      'ORDER_BASE_POINT': 'BASE_PURCHASE',
      'ORDER_MULTIPLE_POINT': 'PURCHASE_BONUS',
      'ORDER_MULTIPLE_POINT_LIMIT': 'PURCHASE_BONUS',
      'FLEXIBLE_CAMPAIGN_BONUS': 'CAMPAIGN',
      'FLEXIBLE_VIP_MULTIPLIER': 'VIP_TIER',
      'FLEXIBLE_BASKET_AMOUNT': 'SPENDING_THRESHOLD',
      'FLEXIBLE_PRODUCT_MULTIPLIER': 'PRODUCT_BONUS',
      'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER': 'PRODUCT_COMBO',
      'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR': 'ENGAGEMENT_ACTIVITY',
      'CONSULTATION_BONUS': 'CONSULTATION',
      'FIRST_PURCHASE_BIRTH_MONTH_BONUS': 'PERSONAL_MILESTONE',
      'INTERACTION_ADJUST_POINT_BY_MANAGER': 'MANUAL_ADJUSTMENT'
    };

    return categories[ruleId] || 'OTHER';
  }

  /**
   * Generate user-friendly description for a rule based on context
   */
  static getDescription(ruleId, market, rewardPoints) {
    const descriptions = {
      'INTERACTION_REGISTRY_POINT': `Welcome bonus for ${market} registration (+${rewardPoints} MD)`,
      'ORDER_BASE_POINT': `Base purchase reward for ${market} market (+${rewardPoints} MD)`,
      'ORDER_MULTIPLE_POINT_LIMIT': `Repeat purchase bonus for ${market} (+${rewardPoints} MD)`,
      'FLEXIBLE_CAMPAIGN_BONUS': `Special campaign bonus for ${market} (+${rewardPoints} MD)`,
      'FLEXIBLE_VIP_MULTIPLIER': `VIP tier multiplier bonus for ${market} (+${rewardPoints} MD)`,
      'FLEXIBLE_BASKET_AMOUNT': `High value purchase threshold bonus (+${rewardPoints} MD)`,
      'FLEXIBLE_PRODUCT_MULTIPLIER': `Product-specific bonus for ${market} (+${rewardPoints} MD)`,
      'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER': `Product combination bonus (+${rewardPoints} MD)`,
      'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR': `Engagement activity reward (+${rewardPoints} MD)`,
      'CONSULTATION_BONUS': `Beauty consultation completion bonus (+${rewardPoints} MD)`,
      'FIRST_PURCHASE_BIRTH_MONTH_BONUS': `Birthday month special bonus (+${rewardPoints} MD)`,
      'INTERACTION_ADJUST_POINT_BY_MANAGER': `Manual account adjustment (+${rewardPoints} MD)`
    };

    return descriptions[ruleId] || `${ruleId} reward applied (+${rewardPoints} MD)`;
  }

  /**
   * Format reward breakdown entry with enhanced information and computation details
   */
  static formatBreakdownEntry(ruleId, rewardPoints, description, params) {
    const breakdown = {
      ruleId: ruleId,
      points: Math.floor(rewardPoints),
      description: description || `${ruleId} reward applied`,
      ruleCategory: FormattingHelpers.getRuleCategory(ruleId),
      computation: FormattingHelpers.generateComputationDetails(ruleId, rewardPoints, params)
    };

    // Add campaign information if available in params
    if (params && (params.campaignId || params.campaignCode)) {
      breakdown.campaignDetails = {
        ...(params.campaignId && { campaignId: params.campaignId }),
        ...(params.campaignCode && { campaignCode: params.campaignCode }),
        ...(params.campaignStart && { campaignStart: params.campaignStart }),
        ...(params.campaignEnd && { campaignEnd: params.campaignEnd })
      };
    }

    return breakdown;
  }

  /**
   * Generate detailed computation information showing how points were calculated
   */
  static generateComputationDetails(ruleId, rewardPoints, params) {
    const details = {
      calculationType: FormattingHelpers.getCalculationType(ruleId),
      formula: FormattingHelpers.getFormula(ruleId, params),
      inputs: FormattingHelpers.getInputValues(ruleId, params),
      result: Math.floor(rewardPoints)
    };

    return details;
  }

  /**
   * Get calculation type for computation details
   */
  static getCalculationType(ruleId) {
    const types = {
      'INTERACTION_REGISTRY_POINT': 'FIXED_BONUS',
      'ORDER_BASE_POINT': 'RATE_MULTIPLICATION',
      'ORDER_MULTIPLE_POINT_LIMIT': 'MULTIPLIER_BONUS',
      'FLEXIBLE_CAMPAIGN_BONUS': 'CAMPAIGN_BONUS',
      'FLEXIBLE_VIP_MULTIPLIER': 'TIER_MULTIPLIER',
      'FLEXIBLE_BASKET_AMOUNT': 'THRESHOLD_BONUS',
      'FLEXIBLE_PRODUCT_MULTIPLIER': 'PRODUCT_MULTIPLIER',
      'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER': 'COMBO_BONUS',
      'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR': 'ACTIVITY_REWARD',
      'CONSULTATION_BONUS': 'CONSULTATION_REWARD',
      'FIRST_PURCHASE_BIRTH_MONTH_BONUS': 'TIMED_MULTIPLIER',
      'INTERACTION_ADJUST_POINT_BY_MANAGER': 'MANUAL_ADJUSTMENT'
    };
    return types[ruleId] || 'UNKNOWN';
  }

  /**
   * Get formula used for calculation with actual values
   */
  static getFormula(ruleId, params) {
    switch (ruleId) {
      case 'INTERACTION_REGISTRY_POINT':
        return `registrationBonus = ${params.registrationBonus || 0}`;
      
      case 'ORDER_BASE_POINT':
        const rate = params.conversionRate || params.tenthsRate || params.standardRate || params.rate || 0;
        return `floor(amount × ${rate})`;
      
      case 'ORDER_MULTIPLE_POINT_LIMIT':
        const baseRate = params.conversionRate || params.tenthsRate || params.standardRate || params.baseRate || params.rate || 0;
        const multiplier = params.multiplier || 1.0;
        return `floor(floor(amount × ${baseRate}) × (${multiplier} - 1.0))`;
      
      case 'FLEXIBLE_CAMPAIGN_BONUS':
        if (params.fixedBonus !== undefined) {
          return `fixedBonus = ${params.fixedBonus}`;
        } else {
          const campaignRate = params.conversionRate || params.tenthsRate || params.standardRate || params.baseRate || params.rate || 0;
          const campaignMultiplier = params.multiplier || 1.0;
          return `floor(floor(amount × ${campaignRate}) × (${campaignMultiplier} - 1.0))`;
        }
      
      case 'FLEXIBLE_VIP_MULTIPLIER':
        const vipRate = params.conversionRate || params.tenthsRate || params.standardRate || params.baseRate || params.rate || 1.0;
        const vipMultiplier = params.multiplier || 1.0;
        return `floor(floor(amount × ${vipRate}) × (${vipMultiplier} - 1.0))`;
      
      case 'FLEXIBLE_BASKET_AMOUNT':
        const threshold = params.threshold || 0;
        const bonus = params.bonus || params.reward || 0;
        return `if amount >= ${threshold} then ${bonus} else 0`;
      
      case 'FLEXIBLE_PRODUCT_MULTIPLIER':
        const prodRate = params.conversionRate || params.tenthsRate || params.standardRate || params.baseRate || params.rate || 1.0;
        const prodMultiplier = params.multiplier || 1.0;
        return `floor(floor(amount × ${prodRate}) × (${prodMultiplier} - 1.0))`;
      
      case 'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER':
        return `comboBonus = ${params.bonus || params.reward || params.fixedBonus || 0}`;
      
      case 'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR':
        const maxItems = params.maxPerYear || params.maxPerPeriod || 'unlimited';
        const rewardPerItem = params.pointsPerBottle || params.rewardPerItem || params.rewardPerActivity || 0;
        return `min(itemCount, ${maxItems}) × ${rewardPerItem}`;
      
      case 'CONSULTATION_BONUS':
        return `consultationBonus = ${params.consultationBonus || 0}`;
      
      case 'FIRST_PURCHASE_BIRTH_MONTH_BONUS':
        const birthRate = params.conversionRate || params.tenthsRate || params.standardRate || params.baseRate || params.rate || 1.0;
        const birthMultiplier = params.multiplier || 1.0;
        return `floor(floor(amount × ${birthRate}) × (${birthMultiplier} - 1.0))`;
      
      case 'INTERACTION_ADJUST_POINT_BY_MANAGER':
        return 'adjustedPoints (manual override)';
      
      default:
        return 'Unknown calculation method';
    }
  }

  /**
   * Get input values used in calculation
   */
  static getInputValues(ruleId, params) {
    const inputs = {};

    // Add specific input values based on rule type - using generic naming
    if (params.conversionRate !== undefined) inputs.conversionRate = params.conversionRate;
    if (params.tenthsRate !== undefined) inputs.tenthsRate = params.tenthsRate;
    if (params.standardRate !== undefined) inputs.standardRate = params.standardRate;
    if (params.rate !== undefined) inputs.rate = params.rate;
    if (params.multiplier !== undefined) inputs.multiplier = params.multiplier;
    if (params.threshold !== undefined) inputs.threshold = params.threshold;
    if (params.bonus !== undefined) inputs.bonus = params.bonus;
    if (params.registrationBonus !== undefined) inputs.registrationBonus = params.registrationBonus;
    if (params.consultationBonus !== undefined) inputs.consultationBonus = params.consultationBonus;
    if (params.fixedBonus !== undefined) inputs.fixedBonus = params.fixedBonus;
    if (params.baseRate !== undefined) inputs.baseRate = params.baseRate;
    if (params.pointsPerBottle !== undefined) inputs.pointsPerBottle = params.pointsPerBottle;
    if (params.maxPerYear !== undefined) inputs.maxPerYear = params.maxPerYear;

    return inputs;
  }

  /**
   * Format the complete response following generalized output template
   */
  static formatEventResponse(eventData, totalRewardsAwarded, rewardBreakdown, errors, newBalance) {
    return {
      consumerId: eventData.consumerId,
      eventId: eventData.eventId,
      eventType: eventData.eventType,
      totalPointsAwarded: totalRewardsAwarded,
      pointBreakdown: rewardBreakdown,
      errors: errors,
      resultingBalance: {
        total: newBalance.total,
        available: newBalance.available,
        used: newBalance.used,
        accountVersion: newBalance.accountVersion
      }
    };
  }
}

module.exports = FormattingHelpers;
