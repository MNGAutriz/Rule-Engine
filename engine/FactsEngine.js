const consumerService = require('../services/consumerService');

/**
 * Facts Engine - Manages dynamic fact computation for the rules engine
 * Follows json-rules-engine fact patterns
 */
class FactsEngine {
  constructor() {
    this.factDefinitions = new Map();
    this.initializeFactDefinitions();
  }

  /**
   * Initialize all fact definitions
   */
  initializeFactDefinitions() {
    // Basic event facts
    this.factDefinitions.set('consumerId', (params, almanac) => params.consumerId);
    this.factDefinitions.set('eventType', (params, almanac) => params.eventType);
    this.factDefinitions.set('market', (params, almanac) => params.market);
    this.factDefinitions.set('channel', (params, almanac) => params.channel);
    this.factDefinitions.set('productLine', (params, almanac) => params.productLine);
    this.factDefinitions.set('timestamp', (params, almanac) => params.timestamp);
    this.factDefinitions.set('context', (params, almanac) => params.context || {});
    this.factDefinitions.set('attributes', (params, almanac) => params.attributes || {});
    
    // Computed facts
    this.factDefinitions.set('eventMonth', (params, almanac) => {
      return new Date(params.timestamp).getMonth() + 1;
    });
    
    this.factDefinitions.set('eventDate', (params, almanac) => {
      return new Date(params.timestamp);
    });
    
    // Consumer-based facts
    this.factDefinitions.set('consumer', async (params, almanac) => {
      return consumerService.getConsumerById(params.consumerId);
    });
    
    this.factDefinitions.set('purchaseCount', async (params, almanac) => {
      return consumerService.getPurchaseCount(params.consumerId);
    });
    
    this.factDefinitions.set('daysSinceFirstPurchase', async (params, almanac) => {
      return consumerService.getDaysSinceFirstPurchase(params.consumerId);
    });
    
    this.factDefinitions.set('isVIP', async (params, almanac) => {
      const consumer = await consumerService.getConsumerById(params.consumerId);
      return consumer?.isVIP || false;
    });
    
    this.factDefinitions.set('birthMonth', async (params, almanac) => {
      const consumer = await consumerService.getConsumerById(params.consumerId);
      return consumer?.birthMonth;
    });
    
    this.factDefinitions.set('isBirthMonth', async (params, almanac) => {
      const consumer = await consumerService.getConsumerById(params.consumerId);
      const eventMonth = new Date(params.timestamp).getMonth() + 1;
      return consumer?.birthMonth === eventMonth;
    });
    
    this.factDefinitions.set('tags', async (params, almanac) => {
      const consumer = await consumerService.getConsumerById(params.consumerId);
      return consumer?.tags || [];
    });
    
    this.factDefinitions.set('isFirstPurchase', async (params, almanac) => {
      const purchaseCount = await consumerService.getPurchaseCount(params.consumerId);
      return purchaseCount === 0;
    });
    
    this.factDefinitions.set('storeType', async (params, almanac) => {
      const storeId = params.context?.storeId || '';
      return storeId.includes('VIP') ? 'VIP' : 'STANDARD';
    });
    
    // Attribute-based facts
    this.factDefinitions.set('attributes.amount', (params, almanac) => {
      return params.attributes?.amount;
    });
    
    this.factDefinitions.set('attributes.srpAmount', (params, almanac) => {
      return params.attributes?.srpAmount;
    });
    
    this.factDefinitions.set('attributes.skuList', (params, almanac) => {
      return params.attributes?.skuList || [];
    });
    
    this.factDefinitions.set('attributes.recycledCount', (params, almanac) => {
      return params.attributes?.recycledCount || 0;
    });
    
    this.factDefinitions.set('attributes.skinTestDate', (params, almanac) => {
      return params.attributes?.skinTestDate;
    });
    
    this.factDefinitions.set('attributes.comboTag', (params, almanac) => {
      return params.attributes?.comboTag;
    });
    
    this.factDefinitions.set('attributes.adjustedPoints', (params, almanac) => {
      return params.attributes?.adjustedPoints || 0;
    });
    
    // Context-based facts
    this.factDefinitions.set('context.externalId', (params, almanac) => {
      return params.context?.externalId;
    });
    
    this.factDefinitions.set('context.storeId', (params, almanac) => {
      return params.context?.storeId;
    });
    
    this.factDefinitions.set('context.campaignCode', (params, almanac) => {
      return params.context?.campaignCode;
    });
  }

  /**
   * Add all facts to the engine
   */
  async addFactsToEngine(engine, eventData) {
    for (const [factName, factFunction] of this.factDefinitions) {
      engine.addFact(factName, factFunction);
    }
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