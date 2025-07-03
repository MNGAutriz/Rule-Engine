const consumerService = require('../services/consumerService');

/**
 * Facts Engine - Manages dynamic fact computation for the rules engine
 * Follows json-rules-engine fact patterns with pure functions
 * All facts are designed to be reusable and focused
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
    // Basic event facts (pure functions)
    this.factDefinitions.set('eventId', (params) => params.eventId);
    this.factDefinitions.set('consumerId', (params) => params.consumerId);
    this.factDefinitions.set('eventType', (params) => params.eventType);
    this.factDefinitions.set('market', (params) => params.market);
    this.factDefinitions.set('channel', (params) => params.channel);
    this.factDefinitions.set('productLine', (params) => params.productLine);
    this.factDefinitions.set('timestamp', (params) => params.timestamp);
    
    // Context facts (pure functions)
    this.factDefinitions.set('context', (params) => params.context || {});
    this.factDefinitions.set('context.externalId', (params) => params.context?.externalId);
    this.factDefinitions.set('context.storeId', (params) => params.context?.storeId);
    this.factDefinitions.set('context.campaignCode', (params) => params.context?.campaignCode);

    // Attributes facts (pure functions)
    this.factDefinitions.set('attributes', (params) => params.attributes || {});
    this.factDefinitions.set('attributes.amount', (params) => params.attributes?.amount);
    this.factDefinitions.set('attributes.currency', (params) => params.attributes?.currency);
    this.factDefinitions.set('attributes.srpAmount', (params) => params.attributes?.srpAmount);
    this.factDefinitions.set('attributes.skuList', (params) => params.attributes?.skuList || []);
    this.factDefinitions.set('attributes.recycledCount', (params) => params.attributes?.recycledCount || 0);
    this.factDefinitions.set('attributes.skinTestDate', (params) => params.attributes?.skinTestDate);
    this.factDefinitions.set('attributes.adjustedPoints', (params) => params.attributes?.adjustedPoints || 0);
    this.factDefinitions.set('attributes.giftValue', (params) => params.attributes?.giftValue || 0);
    this.factDefinitions.set('attributes.burnAmount', (params) => params.attributes?.burnAmount || 0);
    this.factDefinitions.set('attributes.comboTag', (params) => params.attributes?.comboTag);
    this.factDefinitions.set('attributes.note', (params) => params.attributes?.note);

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

    // Consumer-based facts (async functions)
    this.factDefinitions.set('consumer', async (params, almanac) => {
      let consumerId = params?.consumerId;
      if (!consumerId && almanac) {
        consumerId = await almanac.factValue('consumerId');
      }
      return await consumerService.getConsumerById(consumerId);
    });

    this.factDefinitions.set('purchaseCount', async (params, almanac) => {
      // Get consumerId from almanac if not in params
      let consumerId = params?.consumerId;
      if (!consumerId && almanac) {
        consumerId = await almanac.factValue('consumerId');
      }
      
      if (!consumerId) {
        return 0;
      }
      
      return await consumerService.getPurchaseCount(consumerId);
    });

    this.factDefinitions.set('daysSinceFirstPurchase', async (params, almanac) => {
      // Get consumerId from almanac if not in params
      let consumerId = params?.consumerId;
      if (!consumerId && almanac) {
        consumerId = await almanac.factValue('consumerId');
      }
      
      return await consumerService.getDaysSinceFirstPurchase(consumerId);
    });

    this.factDefinitions.set('isVIP', async (params, almanac) => {
      let consumerId = params?.consumerId;
      if (!consumerId && almanac) {
        consumerId = await almanac.factValue('consumerId');
      }
      const consumer = await consumerService.getConsumerById(consumerId);
      return consumer?.isVIP || false;
    });

    this.factDefinitions.set('birthMonth', async (params, almanac) => {
      let consumerId = params?.consumerId;
      if (!consumerId && almanac) {
        consumerId = await almanac.factValue('consumerId');
      }
      const consumer = await consumerService.getConsumerById(consumerId);
      return consumer?.birthMonth;
    });

    this.factDefinitions.set('isBirthMonth', async (params, almanac) => {
      let consumerId = params?.consumerId;
      if (!consumerId && almanac) {
        consumerId = await almanac.factValue('consumerId');
      }
      const consumer = await consumerService.getConsumerById(consumerId);
      const eventMonth = new Date(params.timestamp).getMonth() + 1;
      return consumer?.birthMonth === eventMonth;
    });

    this.factDefinitions.set('tags', async (params, almanac) => {
      let consumerId = params?.consumerId;
      if (!consumerId && almanac) {
        consumerId = await almanac.factValue('consumerId');
      }
      const consumer = await consumerService.getConsumerById(consumerId);
      return consumer?.tags || [];
    });

    this.factDefinitions.set('isFirstPurchase', async (params, almanac) => {
      let consumerId = params?.consumerId;
      if (!consumerId && almanac) {
        consumerId = await almanac.factValue('consumerId');
      }
      const purchaseCount = await consumerService.getPurchaseCount(consumerId);
      return purchaseCount === 0;
    });

    this.factDefinitions.set('hasTag', async (params, almanac) => {
      // This is a parameterized fact that can be used like: 
      // { "fact": "hasTag", "params": { "tag": "PREMIUM" }, "operator": "equal", "value": true }
      let consumerId = params?.consumerId;
      if (!consumerId && almanac) {
        consumerId = await almanac.factValue('consumerId');
      }
      const consumer = await consumerService.getConsumerById(consumerId);
      const tags = consumer?.tags || [];
      const requiredTag = params.tag || almanac.factValue('ruleParams.tag');
      return tags.includes(requiredTag);
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

    // Amount-based facts (pure functions with calculations)
    this.factDefinitions.set('amountInBasePoints', (params) => {
      const market = params.market;
      const amount = params.attributes?.amount || 0;
      const srpAmount = params.attributes?.srpAmount || 0;
      
      if (market === 'JP') {
        return Math.floor(amount * 0.1);
      } else {
        return Math.floor(srpAmount || amount);
      }
    });

    this.factDefinitions.set('isHighValuePurchase', (params) => {
      const market = params.market;
      const amount = params.attributes?.amount || 0;
      const srpAmount = params.attributes?.srpAmount || 0;
      
      const thresholds = { JP: 5000, HK: 3000, TW: 3000 };
      const baseAmount = market === 'JP' ? amount : (srpAmount || amount);
      
      return baseAmount >= (thresholds[market] || 3000);
    });
  }

    // Add all facts to the engine
  async addFactsToEngine(engine, eventData) {
    for (const [factName, factFunction] of this.factDefinitions) {
      engine.addFact(factName, factFunction);
    }
    
    // Add debug facts for attributes
    engine.addFact('debug.srpAmount', (params) => {
      const value = params.attributes?.srpAmount;
      console.log(`🔍 DEBUG FACT: srpAmount = ${value} (${typeof value})`);
      console.log(`🔍 DEBUG FACT: params = ${JSON.stringify(params, null, 2)}`);
      return value;
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
    const availableFacts = this.getAvailableFacts();
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