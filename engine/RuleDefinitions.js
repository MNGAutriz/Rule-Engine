/**
 * Rule Definitions - Contains all rule logic organized by the 4 main types:
 * 1. Basket Rules
 * 2. Consumer Attribute Rules  
 * 3. Product Rules
 * 4. Transaction Rules
 */
class RuleDefinitions {
  constructor() {
    this.rules = {
      basket: this.getBasketRules(),
      consumer: this.getConsumerAttributeRules(),
      product: this.getProductRules(),
      transaction: this.getTransactionRules()
    };
  }

  /**
   * Get base rules for an event type
   */
  getBaseRules(eventType) {
    const rules = [];
    
    switch (eventType) {
      case 'PURCHASE':
        // Always apply base points for purchases
        rules.push({
          conditions: { all: [{ fact: 'eventType', operator: 'equal', value: 'PURCHASE' }] },
          event: { type: 'ORDER_BASE_POINT', params: {} },
          priority: 10
        });
        break;
        
      case 'INTERACTION':
        // Registration bonus
        rules.push({
          conditions: { 
            all: [
              { fact: 'eventType', operator: 'equal', value: 'INTERACTION' },
              { fact: 'context.externalId', operator: 'contains', value: 'reg' }
            ]
          },
          event: { type: 'INTERACTION_REGISTRY_POINT', params: { registrationBonus: 150 } },
          priority: 8
        });
        break;
        
      case 'ADJUSTMENT':
        rules.push({
          conditions: { all: [{ fact: 'eventType', operator: 'equal', value: 'ADJUSTMENT' }] },
          event: { type: 'INTERACTION_ADJUST_POINT_BY_MANAGER', params: {} },
          priority: 1
        });
        break;
    }
    
    return rules;
  }

  /**
   * Get campaign-specific rules
   */
  getCampaignRules(campaign) {
    return campaign.ruleIds.map(ruleId => {
      const rule = this.getRuleById(ruleId);
      if (rule) {
        // Add campaign context to rule params
        return {
          ...rule,
          event: {
            ...rule.event,
            params: {
              ...rule.event.params,
              campaignId: campaign.campaignId,
              campaignCode: campaign.campaignCode,
              campaignStart: campaign.startDate,
              campaignEnd: campaign.endDate
            }
          }
        };
      }
      return null;
    }).filter(Boolean);
  }

  /**
   * Get context-specific rules (market/channel)
   */
  getContextRules(market, channel, eventType) {
    const rules = [];
    
    // Add any market or channel specific rules here
    // For now, returning empty array but this is where you'd add
    // market-specific multipliers or channel-specific bonuses
    
    return rules;
  }

  /**
   * Get rule by ID
   */
  getRuleById(ruleId) {
    // Search through all rule categories
    for (const category of Object.values(this.rules)) {
      const rule = category.find(r => r.event.type === ruleId);
      if (rule) return rule;
    }
    return null;
  }

  /**
   * BASKET THRESHOLD RULES
   * Rules based on basket value, total spend, etc.
   */
  getBasketRules() {
    return [
      {
        name: 'High Value Basket Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'attributes.srpAmount', operator: 'greaterThanInclusive', value: 5000 }
          ]
        },
        event: {
          type: 'FLEXIBLE_BASKET_AMOUNT',
          params: { threshold: 5000, bonus: 200 }
        },
        priority: 4
      },
      {
        name: 'Premium Basket Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'attributes.srpAmount', operator: 'greaterThanInclusive', value: 10000 }
          ]
        },
        event: {
          type: 'FLEXIBLE_BASKET_AMOUNT',
          params: { threshold: 10000, bonus: 500 }
        },
        priority: 3
      },
      {
        name: 'Ultra Premium Basket Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'attributes.srpAmount', operator: 'greaterThanInclusive', value: 20000 }
          ]
        },
        event: {
          type: 'FLEXIBLE_BASKET_AMOUNT',
          params: { threshold: 20000, bonus: 1000 }
        },
        priority: 2
      }
    ];
  }

  /**
   * CONSUMER ATTRIBUTE RULES
   * Rules based on consumer properties like VIP status, birth month, etc.
   */
  getConsumerAttributeRules() {
    return [
      {
        name: 'Birth Month First Purchase Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'birthMonth', operator: 'equal', value: { fact: 'eventMonth' } },
            { fact: 'isFirstPurchase', operator: 'equal', value: true }
          ]
        },
        event: {
          type: 'FIRST_PURCHASE_BIRTH_MONTH_BONUS',
          params: { multiplier: 1.1 }
        },
        priority: 5
      },
      {
        name: 'VIP Store Multiplier',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'isVIP', operator: 'equal', value: true },
            { fact: 'storeType', operator: 'equal', value: 'VIP' }
          ]
        },
        event: {
          type: 'FLEXIBLE_VIP_MULTIPLIER',
          params: { multiplier: 2.0 }
        },
        priority: 4
      },
      {
        name: 'Premium Customer Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'tags', operator: 'contains', value: 'PREMIUM' }
          ]
        },
        event: {
          type: 'FLEXIBLE_VIP_MULTIPLIER',
          params: { multiplier: 1.5 }
        },
        priority: 6
      },
      {
        name: 'New Customer Welcome Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'tags', operator: 'contains', value: 'NEW_CUSTOMER' },
            { fact: 'purchaseCount', operator: 'equal', value: 0 }
          ]
        },
        event: {
          type: 'FLEXIBLE_CAMPAIGN_BONUS',
          params: { fixedBonus: 500 }
        },
        priority: 3
      }
    ];
  }

  /**
   * PRODUCT RULES
   * Rules based on specific products, SKUs, combos, etc.
   */
  getProductRules() {
    return [
      {
        name: 'FTE Product Multiplier',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'attributes.skuList', operator: 'contains', value: 'FTE_SKU_001' }
          ]
        },
        event: {
          type: 'FLEXIBLE_PRODUCT_MULTIPLIER',
          params: { multiplier: 1.5 }
        },
        priority: 5
      },
      {
        name: 'Essence Series Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'productLine', operator: 'equal', value: 'ESSENCE_SERIES' }
          ]
        },
        event: {
          type: 'FLEXIBLE_PRODUCT_MULTIPLIER',
          params: { multiplier: 1.2 }
        },
        priority: 6
      },
      {
        name: 'Moisture Combo Set Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'attributes.skuList', operator: 'contains', value: 'SKU_X' },
            { fact: 'attributes.skuList', operator: 'contains', value: 'SKU_Y' }
          ]
        },
        event: {
          type: 'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER',
          params: { bonus: 250 }
        },
        priority: 4
      },
      {
        name: 'Treatment Series Premium Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'productLine', operator: 'equal', value: 'TREATMENT_SERIES' },
            { fact: 'attributes.amount', operator: 'greaterThanInclusive', value: 3000 }
          ]
        },
        event: {
          type: 'FLEXIBLE_PRODUCT_MULTIPLIER',
          params: { multiplier: 1.8 }
        },
        priority: 3
      },
      {
        name: 'Full Regimen Combo Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'attributes.comboTag', operator: 'equal', value: 'COMBO_MOISTURE_SET' }
          ]
        },
        event: {
          type: 'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER',
          params: { bonus: 400 }
        },
        priority: 2
      }
    ];
  }

  /**
   * TRANSACTION RULES
   * Rules based on transaction history, frequency, timing, etc.
   */
  getTransactionRules() {
    return [
      {
        name: 'Second Purchase Within 60 Days',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'daysSinceFirstPurchase', operator: 'lessThanInclusive', value: 60 },
            { fact: 'purchaseCount', operator: 'equal', value: 1 }
          ]
        },
        event: {
          type: 'ORDER_MULTIPLE_POINT',
          params: { multiplier: 2.0 }
        },
        priority: 5
      },
      {
        name: 'Frequent Shopper Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'purchaseCount', operator: 'greaterThanInclusive', value: 5 }
          ]
        },
        event: {
          type: 'FLEXIBLE_CAMPAIGN_BONUS',
          params: { fixedBonus: 300 }
        },
        priority: 4
      },
      {
        name: 'Bottle Recycling Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'INTERACTION' },
            { fact: 'attributes.recycledCount', operator: 'greaterThan', value: 0 }
          ]
        },
        event: {
          type: 'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR',
          params: { pointsPerBottle: 50, maxPerYear: 5 }
        },
        priority: 6
      },
      {
        name: 'Skin Test Completion Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'INTERACTION' },
            { fact: 'attributes.skinTestDate', operator: 'notEqual', value: null },
            { fact: 'daysSinceFirstPurchase', operator: 'lessThanInclusive', value: 60 }
          ]
        },
        event: {
          type: 'INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS',
          params: { skinTestBonus: 75 }
        },
        priority: 7
      },
      {
        name: 'Monthly Purchase Streak Bonus',
        conditions: {
          all: [
            { fact: 'eventType', operator: 'equal', value: 'PURCHASE' },
            { fact: 'purchaseCount', operator: 'greaterThanInclusive', value: 3 }
          ]
        },
        event: {
          type: 'FLEXIBLE_CAMPAIGN_BONUS',
          params: { fixedBonus: 150 }
        },
        priority: 8
      }
    ];
  }

  /**
   * Get all rules for debugging/admin purposes
   */
  getAllRules() {
    return {
      basket: this.rules.basket,
      consumer: this.rules.consumer,
      product: this.rules.product,
      transaction: this.rules.transaction
    };
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category) {
    return this.rules[category] || [];
  }
}

module.exports = RuleDefinitions;
