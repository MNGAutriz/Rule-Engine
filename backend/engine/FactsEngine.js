const consumerService = require('../services/consumerService');
const { logger } = require('../src/utils');

/**
 * Facts Engine - Manages dynamic fact computation for the rules engine
 * Follows json-rules-engine fact patterns with pure functions
 * All facts are designed to be reusable and region-agnostic
 */
class FactsEngine {
  constructor() {
    this.factDefinitions = new Map();
    this.initializeFactDefinitions();
  }

  /**
   * Initialize all fact definitions with pure functions
   * Following json-rules-engine best practices
   */
  initializeFactDefinitions() {
    // Context facts - accessing nested properties
    // Note: json-rules-engine automatically creates facts for top-level properties
    // We only need to define custom facts for computed or nested values
    this.factDefinitions.set('context.storeId', (params, almanac) => {
      return almanac.factValue('context').then(context => context?.storeId);
    });
    this.factDefinitions.set('context.campaignCode', (params, almanac) => {
      return almanac.factValue('context').then(context => context?.campaignCode);
    });

    // Attributes facts - accessing nested properties
    this.factDefinitions.set('attributes.amount', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.amount);
    });
    this.factDefinitions.set('attributes.currency', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.currency);
    });
    // Amount fact - the only field we need for calculations
    this.factDefinitions.set('attributes.skuList', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.skuList || []);
    });
    this.factDefinitions.set('attributes.recycledCount', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.recycledCount || 0);
    });
    this.factDefinitions.set('attributes.skinTestDate', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.skinTestDate);
    });
    this.factDefinitions.set('attributes.adjustedPoints', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.adjustedPoints || 0);
    });
    this.factDefinitions.set('attributes.redemptionPoints', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.redemptionPoints || 0);
    });
    this.factDefinitions.set('attributes.giftValue', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.giftValue || 0);
    });
    this.factDefinitions.set('attributes.burnAmount', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.burnAmount || 0);
    });
    this.factDefinitions.set('attributes.comboTag', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.comboTag);
    });
    this.factDefinitions.set('attributes.note', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.note);
    });

    // Computed date/time facts (pure functions)
    this.factDefinitions.set('eventMonth', (params) => {
      return new Date(params.timestamp).getMonth() + 1;
    });
    
    this.factDefinitions.set('eventDate', async (params, almanac) => {
      if (almanac) {
        const timestamp = await almanac.factValue('timestamp');
        return new Date(timestamp).toISOString().substr(0, 10); // Return YYYY-MM-DD string
      } else {
        // Fallback for direct testing
        return new Date(params.timestamp).toISOString().substr(0, 10);
      }
    });

    this.factDefinitions.set('eventYear', (params) => {
      return new Date(params.timestamp).getFullYear();
    });

    this.factDefinitions.set('dayOfWeek', (params) => {
      return new Date(params.timestamp).getDay();
    });

    this.factDefinitions.set('isWeekend', (params) => {
      const dayOfWeek = new Date(params.timestamp).getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    });

    // Store-based facts (pure functions)
    this.factDefinitions.set('storeType', (params) => {
      const storeId = params.context?.storeId || '';
      return storeId.includes('VIP') ? 'VIP' : 'STANDARD';
    });

    this.factDefinitions.set('isVIPStore', (params) => {
      const storeId = params.context?.storeId || '';
      return storeId.includes('VIP');
    });

    this.factDefinitions.set('isPremiumLocation', (params) => {
      const storeId = params.context?.storeId || '';
      return storeId.includes('VIP') || storeId.includes('PREMIUM');
    });

    // Consumer-based facts (async functions with error handling)
    this.factDefinitions.set('consumer', async (params, almanac) => {
      try {
        let consumerId = params?.consumerId;
        if (!consumerId && almanac) {
          consumerId = await almanac.factValue('consumerId');
        }
        return await consumerService.getConsumerById(consumerId);
      } catch (error) {
        logger.debug('Consumer fact failed, returning null', { error: error.message });
        return null;
      }
    });

    this.factDefinitions.set('purchaseCount', async (params, almanac) => {
      try {
        // Get consumerId from almanac if not in params
        let consumerId = params?.consumerId;
        if (!consumerId && almanac) {
          consumerId = await almanac.factValue('consumerId');
        }
        
        if (!consumerId) {
          return 0;
        }
        
        return await consumerService.getPurchaseCount(consumerId);
      } catch (error) {
        logger.debug('PurchaseCount fact failed, returning 0', { error: error.message });
        return 0;
      }
    });

    this.factDefinitions.set('daysSinceFirstPurchase', async (params, almanac) => {
      try {
        // Get consumerId from almanac if not in params
        let consumerId = params?.consumerId;
        if (!consumerId && almanac) {
          consumerId = await almanac.factValue('consumerId');
        }
        
        return await consumerService.getDaysSinceFirstPurchase(consumerId);
      } catch (error) {
        logger.debug('DaysSinceFirstPurchase fact failed, returning 0', { error: error.message });
        return 0;
      }
    });

    this.factDefinitions.set('isVIP', async (params, almanac) => {
      try {
        let consumerId = params?.consumerId;
        if (!consumerId && almanac) {
          consumerId = await almanac.factValue('consumerId');
        }
        const consumer = await consumerService.getConsumerById(consumerId);
        const tier = consumer?.profile?.tier || 'STANDARD';
        return tier.includes('VIP') || tier.includes('PLATINUM');
      } catch (error) {
        logger.debug('IsVIP fact failed, returning false', { error: error.message });
        return false;
      }
    });

    this.factDefinitions.set('birthMonth', async (params, almanac) => {
      try {
        let consumerId = params?.consumerId;
        if (!consumerId && almanac) {
          consumerId = await almanac.factValue('consumerId');
        }
        const consumer = await consumerService.getConsumerById(consumerId);
        const birthDate = consumer?.profile?.birthDate;
        return birthDate ? new Date(birthDate).getMonth() + 1 : null;
      } catch (error) {
        logger.debug('BirthMonth fact failed, returning null', { error: error.message });
        return null;
      }
    });

    this.factDefinitions.set('isBirthMonth', async (params, almanac) => {
      try {
        let consumerId = params?.consumerId;
        if (!consumerId && almanac) {
          consumerId = await almanac.factValue('consumerId');
        }
        const consumer = await consumerService.getConsumerById(consumerId);
        const birthDate = consumer?.profile?.birthDate;
        const birthMonth = birthDate ? new Date(birthDate).getMonth() + 1 : null;
        const eventMonth = new Date(params.timestamp).getMonth() + 1;
        return birthMonth === eventMonth;
      } catch (error) {
        logger.debug('IsBirthMonth fact failed, returning false', { error: error.message });
        return false;
      }
    });

    // Age fact - calculates age from birthDate (optional, returns 0 if not available)
    this.factDefinitions.set('age', async (params, almanac) => {
      try {
        let consumerId = params?.consumerId;
        if (!consumerId && almanac) {
          consumerId = await almanac.factValue('consumerId');
        }
        const consumer = await consumerService.getConsumerById(consumerId);
        const birthDate = consumer?.profile?.birthDate;
        if (!birthDate) {
          return 0; // Default age if not available
        }
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      } catch (error) {
        logger.debug('Age fact calculation failed, returning default', { error: error.message });
        return 0; // Default age on any error
      }
    });

    this.factDefinitions.set('lastPurchaseDate', async (params, almanac) => {
      try {
        let consumerId = params?.consumerId;
        if (!consumerId && almanac) {
          consumerId = await almanac.factValue('consumerId');
        }
        const consumer = await consumerService.getConsumerById(consumerId);
        return consumer?.engagement?.lastPurchaseDate || null;
      } catch (error) {
        logger.debug('LastPurchaseDate fact calculation failed, returning null', { error: error.message });
        return null; // Return null if consumer data is not available
      }
    });

    // Note: tags system removed from user structure - facts kept for backward compatibility
    this.factDefinitions.set('tags', async (params, almanac) => {
      // Tags are no longer part of the user structure - return empty array
      return [];
    });

    this.factDefinitions.set('isFirstPurchase', async (params, almanac) => {
      try {
        let consumerId = params?.consumerId;
        if (!consumerId && almanac) {
          consumerId = await almanac.factValue('consumerId');
        }
        const purchaseCount = await consumerService.getPurchaseCount(consumerId);
        return purchaseCount === 0;
      } catch (error) {
        logger.debug('IsFirstPurchase fact failed, returning false', { error: error.message });
        return false;
      }
    });

    this.factDefinitions.set('hasTag', async (params, almanac) => {
      // Tags system removed - this fact always responds false for backward compatibility
      return false;
    });

    // SKU-based facts (pure functions)
    this.factDefinitions.set('hasSku', (params, almanac) => {
      // Parameterized fact for checking if specific SKU exists
      const skuList = params.attributes?.skuList || [];
      const requiredSku = params.sku || almanac.factValue('ruleParams.sku');
      return skuList.includes(requiredSku);
    });

    this.factDefinitions.set('hasAnySkuFromList', (params, almanac) => {
      // Check if any SKU from a provided list exists in the purchase
      const skuList = params.attributes?.skuList || [];
      const requiredSkus = params.skuList || almanac.factValue('ruleParams.skuList') || [];
      return requiredSkus.some(sku => skuList.includes(sku));
    });

    this.factDefinitions.set('hasAllSkusFromList', (params, almanac) => {
      // Check if all SKUs from a provided list exist in the purchase
      const skuList = params.attributes?.skuList || [];
      const requiredSkus = params.skuList || almanac.factValue('ruleParams.skuList') || [];
      return requiredSkus.every(sku => skuList.includes(sku));
    });

    // Convenience shortcuts for common attributes
    this.factDefinitions.set('redemptionPoints', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.redemptionPoints || 0);
    });
    
    this.factDefinitions.set('transactionAmount', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.amount || 0);
    });
    
    this.factDefinitions.set('discountedAmount', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.amount || 0); // No SRP, just use amount
    });

    // Backward compatibility alias for orderTotal
    this.factDefinitions.set('orderTotal', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.amount || 0);
    });

    // Amount-based facts (pure functions with calculations)
    this.factDefinitions.set('amountInBasePoints', (params) => {
      const market = params.market;
      const amount = params.attributes?.amount || 0;
      
      if (market === 'JP') {
        return Math.floor(amount * 0.1);
      } else {
        return Math.floor(amount); // Use actual amount
      }
    });

    this.factDefinitions.set('isHighValuePurchase', (params) => {
      const market = params.market;
      const amount = params.attributes?.amount || 0;
      
      const thresholds = { JP: 5000, HK: 3000, TW: 3000 };
      const baseAmount = amount; // Use actual amount
      
      return baseAmount >= (thresholds[market] || 3000);
    });
  }

  // Add all facts to the engine
  async addFactsToEngine(engine, eventData) {
    for (const [factName, factFunction] of this.factDefinitions) {
      engine.addFact(factName, factFunction);
    }
    
    logger.debug('Facts engine initialization complete', {
      totalFacts: this.factDefinitions.size,
      keyFacts: ['eventType', 'market', 'context.storeId']
    });
  }

  /**
   * Add a custom fact
   */
  addFact(name, factFunction) {
    this.factDefinitions.set(name, factFunction);
  }

  /**
   * Remove a fact
   */
  removeFact(name) {
    this.factDefinitions.delete(name);
  }

  /**
   * Get all available fact names
   */
  getAvailableFacts() {
    return Array.from(this.factDefinitions.keys());
  }

  /**
   * Validate that all required facts are available for rules
   */
  validateFactsForRules(rules) {
    const definedFacts = this.getAvailableFacts();
    
    // Basic facts that are automatically available from event data top-level properties
    const basicFacts = [
      'eventId', 'consumerId', 'eventType', 'market', 'channel', 
      'productLine', 'timestamp', 'context', 'attributes'
    ];
    
    const availableFacts = [...definedFacts, ...basicFacts];
    const missingFacts = [];

    const checkCondition = (condition) => {
      if (condition.fact && !availableFacts.includes(condition.fact)) {
        missingFacts.push(condition.fact);
      }
      if (condition.all) {
        condition.all.forEach(checkCondition);
      }
      if (condition.any) {
        condition.any.forEach(checkCondition);
      }
    };

    rules.forEach(rule => {
      checkCondition(rule.conditions);
    });

    return {
      isValid: missingFacts.length === 0,
      missingFacts: [...new Set(missingFacts)]
    };
  }
}

module.exports = FactsEngine;