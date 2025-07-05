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
      'INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS': 'ENGAGEMENT_ACTIVITY',
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
      'INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS': `Skin assessment completion bonus (+${rewardPoints} MD)`,
      'FIRST_PURCHASE_BIRTH_MONTH_BONUS': `Birthday month special bonus (+${rewardPoints} MD)`,
      'INTERACTION_ADJUST_POINT_BY_MANAGER': `Manual account adjustment (+${rewardPoints} MD)`
    };

    return descriptions[ruleId] || `${ruleId} reward applied (+${rewardPoints} MD)`;
  }

  /**
   * Format reward breakdown entry with enhanced information
   */
  static formatBreakdownEntry(ruleId, rewardPoints, description, params) {
    const breakdown = {
      ruleId: ruleId,
      points: Math.floor(rewardPoints),
      description: description || `${ruleId} reward applied`,
      ruleCategory: FormattingHelpers.getRuleCategory(ruleId)
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
