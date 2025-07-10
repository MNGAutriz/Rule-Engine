const consumerService = require('../services/consumerService');
const { logger } = require('../src/utils');

/**
 * FACTS ENGINE - The Foundation of Rule Evaluation
 * 
 * WHAT IT DOES:
 * - Defines and manages all "facts" that rules can evaluate against
 * - Facts are computed values derived from event data (e.g., event amount, consumer tier, etc.)
 * - Provides a centralized repository of reusable fact definitions
 * 
 * HOW IT WORKS:
 * 1. Facts are defined as functions that compute values from event data
 * 2. Each fact function receives (params, almanac) where:
 *    - params: Raw event data passed to the rules engine
 *    - almanac: json-rules-engine's fact resolver for accessing other facts
 * 3. Facts can be synchronous (return value) or asynchronous (return Promise)
 * 4. Facts are lazy-loaded - only computed when actually needed by rules
 * 
 * FACT CATEGORIES:
 * - Context facts: Store ID, campaign codes from event context
 * - Attribute facts: Transaction amounts, SKU lists, etc. from event attributes
 * - Date/time facts: Event timing, weekends, birth months
 * - Consumer facts: VIP status, purchase history, demographics
 * - Calculation facts: Market-specific point calculations
 */
class FactsEngine {
  constructor() {
    // Map to store all fact definitions: factName -> computationFunction
    this.factDefinitions = new Map();
    this.initializeFactDefinitions();
  }

  /**
   * INITIALIZE ALL FACT DEFINITIONS
   * Called once during engine startup to register all available facts
   */
  initializeFactDefinitions() {
    
    // =================================================================
    // CONTEXT FACTS - Extract data from event.context object
    // These provide access to contextual information about the event
    // =================================================================
    
    // Extract store ID from event context (used for store-specific rules)
    this.factDefinitions.set('context.storeId', (params, almanac) => {
      return almanac.factValue('context').then(context => context?.storeId);
    });
    
    // Extract campaign code from event context (used for campaign-specific bonuses)
    this.factDefinitions.set('context.campaignCode', (params, almanac) => {
      return almanac.factValue('context').then(context => context?.campaignCode);
    });

    // =================================================================
    // ATTRIBUTE FACTS - Extract data from event.attributes object
    // These provide access to transaction details and event-specific data
    // =================================================================
    const attributeFields = [
      'amount',          // Transaction amount (primary field for point calculations)
      'currency',        // Currency code (HKD, TWD, JPY)
      'skuList',         // Array of purchased SKUs (for product-specific rules)
      'recycledCount',   // Number of recycled items (for recycling events)
      'skinTestDate',    // Date of skin test (for consultation events)
      'adjustedPoints',  // Manual point adjustments
      'redemptionPoints',// Points being redeemed
      'giftValue',       // Value of gift received
      'burnAmount',      // Amount burned/deducted
      'comboTag',        // Product combo identifier
      'note'             // Additional notes
    ];

    // Dynamically create facts for each attribute field
    attributeFields.forEach(field => {
      this.factDefinitions.set(`attributes.${field}`, (params, almanac) => {
        return almanac.factValue('attributes').then(attributes => 
          // Special handling: skuList returns array, others return number/string with default 0
          field === 'skuList' ? (attributes?.[field] || []) : (attributes?.[field] || 0)
        );
      });
    });

    // =================================================================
    // CONVENIENCE SHORTCUTS - Common attribute access patterns
    // These provide easier access to frequently used attribute values
    // =================================================================
    
    // Direct access to redemption points (commonly used in redemption rules)
    this.factDefinitions.set('redemptionPoints', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.redemptionPoints || 0);
    });
    
    // Transaction amount aliases (different rules may use different naming conventions)
    this.factDefinitions.set('transactionAmount', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.amount || 0);
    });
    this.factDefinitions.set('discountedAmount', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.amount || 0);
    });
    this.factDefinitions.set('orderTotal', (params, almanac) => {
      return almanac.factValue('attributes').then(attributes => attributes?.amount || 0);
    });

    // =================================================================
    // DATE/TIME FACTS - Temporal information for time-based rules
    // These extract timing information from the event timestamp
    // =================================================================
    
    // Extract month number (1-12) from event timestamp
    // Used for: birthday month bonuses, seasonal campaigns
    this.factDefinitions.set('eventMonth', (params) => {
      return new Date(params.timestamp).getMonth() + 1;
    });
    
    // Extract date string (YYYY-MM-DD) from event timestamp
    // Used for: daily limits, date-specific promotions
    this.factDefinitions.set('eventDate', async (params, almanac) => {
      const timestamp = almanac ? await almanac.factValue('timestamp') : params.timestamp;
      return new Date(timestamp).toISOString().substr(0, 10);
    });
    
    // Extract year from event timestamp
    // Used for: yearly limits, annual campaigns
    this.factDefinitions.set('eventYear', (params) => {
      return new Date(params.timestamp).getFullYear();
    });
    
    // Extract day of week (0=Sunday, 6=Saturday)
    // Used for: weekend bonuses, weekday-specific rules
    this.factDefinitions.set('dayOfWeek', (params) => {
      return new Date(params.timestamp).getDay();
    });
    
    // Check if event occurred on weekend
    // Used for: weekend shopping bonuses
    this.factDefinitions.set('isWeekend', (params) => {
      const dayOfWeek = new Date(params.timestamp).getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    });

    // =================================================================
    // STORE FACTS - Information about store/location characteristics
    // These provide store-specific data for location-based rules
    // =================================================================
    
    // Determine store type based on store ID pattern
    // Used for: store-type specific bonuses
    this.factDefinitions.set('storeType', (params) => {
      const storeId = params.context?.storeId || '';
      return storeId.includes('VIP') ? 'VIP' : 'STANDARD';
    });
    
    // Check if store is a VIP location
    // Used for: VIP store bonuses
    this.factDefinitions.set('isVIPStore', (params) => {
      const storeId = params.context?.storeId || '';
      return storeId.includes('VIP');
    });
    
    // Check if store is premium location (VIP or PREMIUM)
    // Used for: premium location bonuses
    this.factDefinitions.set('isPremiumLocation', (params) => {
      const storeId = params.context?.storeId || '';
      return storeId.includes('VIP') || storeId.includes('PREMIUM');
    });

    // =================================================================
    // CONSUMER FACTS - Customer profile and behavior data
    // These facts require database lookups and provide customer insights
    // IMPORTANT: These are async facts that call external services
    // =================================================================
    
    // Calculate days since consumer's first purchase
    // Used for: new customer bonuses, loyalty tenure rules
    this.factDefinitions.set('daysSinceFirstPurchase', async (params, almanac) => {
      try {
        const consumerId = params?.consumerId || await almanac.factValue('consumerId');
        return await consumerService.getDaysSinceFirstPurchase(consumerId);
      } catch (error) {
        logger.debug('DaysSinceFirstPurchase fact failed', { error: error.message });
        return 0; // Safe fallback
      }
    });

    // Check if consumer has VIP/Platinum tier status
    // Used for: tier-based bonuses and multipliers
    this.factDefinitions.set('isVIP', async (params, almanac) => {
      try {
        const consumerId = params?.consumerId || await almanac.factValue('consumerId');
        const consumer = await consumerService.getConsumerById(consumerId);
        const tier = consumer?.profile?.tier || 'STANDARD';
        return tier.includes('VIP') || tier.includes('PLATINUM');
      } catch (error) {
        return false; // Safe fallback
      }
    });

    // Get consumer's birth month (1-12)
    // Used for: birthday month bonuses
    this.factDefinitions.set('birthMonth', async (params, almanac) => {
      try {
        const consumerId = params?.consumerId || await almanac.factValue('consumerId');
        const consumer = await consumerService.getConsumerById(consumerId);
        const birthDate = consumer?.profile?.birthDate;
        return birthDate ? new Date(birthDate).getMonth() + 1 : null;
      } catch (error) {
        return null; // Safe fallback
      }
    });

    // Check if current event is in consumer's birth month
    // Used for: birthday month special bonuses
    this.factDefinitions.set('isBirthMonth', async (params, almanac) => {
      try {
        const consumerId = params?.consumerId || await almanac.factValue('consumerId');
        const consumer = await consumerService.getConsumerById(consumerId);
        const birthDate = consumer?.profile?.birthDate;
        if (!birthDate) return false;
        const birthMonth = new Date(birthDate).getMonth() + 1;
        const eventMonth = new Date(params.timestamp).getMonth() + 1;
        return birthMonth === eventMonth;
      } catch (error) {
        return false; // Safe fallback
      }
    });

    // Check if this is consumer's first purchase
    // Used for: first purchase bonuses, welcome rewards
    this.factDefinitions.set('isFirstPurchase', async (params, almanac) => {
      try {
        const consumerId = params?.consumerId || await almanac.factValue('consumerId');
        const purchaseCount = await consumerService.getPurchaseCount(consumerId);
        return purchaseCount === 0;
      } catch (error) {
        return false; // Safe fallback
      }
    });

    // =================================================================
    // SKU FACTS - Product-specific logic for purchases
    // These check for specific products in the transaction
    // =================================================================
    
    // Check if transaction contains a specific SKU
    // Used for: product-specific bonuses
    this.factDefinitions.set('hasSku', (params, almanac) => {
      const skuList = params.attributes?.skuList || [];
      const requiredSku = params.sku || almanac.factValue('ruleParams.sku');
      return skuList.includes(requiredSku);
    });

    // Check if transaction contains ANY SKU from a required list
    // Used for: category bonuses, promotional product groups
    this.factDefinitions.set('hasAnySkuFromList', (params, almanac) => {
      const skuList = params.attributes?.skuList || [];
      const requiredSkus = params.skuList || almanac.factValue('ruleParams.skuList') || [];
      return requiredSkus.some(sku => skuList.includes(sku));
    });

    // Check if transaction contains ALL SKUs from a required list
    // Used for: combo bonuses, bundle requirements
    this.factDefinitions.set('hasAllSkusFromList', (params, almanac) => {
      const skuList = params.attributes?.skuList || [];
      const requiredSkus = params.skuList || almanac.factValue('ruleParams.skuList') || [];
      return requiredSkus.every(sku => skuList.includes(sku));
    });

    // Calculation facts
    this.factDefinitions.set('amountInBasePoints', (params) => {
      const market = params.market;
      const amount = params.attributes?.amount || 0;
      return market === 'JP' ? Math.floor(amount * 0.1) : Math.floor(amount);
    });

    this.factDefinitions.set('isHighValuePurchase', (params) => {
      const market = params.market;
      const amount = params.attributes?.amount || 0;
      const thresholds = { JP: 5000, HK: 3000, TW: 3000 };
      return amount >= (thresholds[market] || 3000);
    });

    // Backward compatibility
    this.factDefinitions.set('hasTag', async () => false);
  }

  async addFactsToEngine(engine, eventData) {
    for (const [factName, factFunction] of this.factDefinitions) {
      engine.addFact(factName, factFunction);
    }
    
    logger.debug('Facts engine initialization complete', {
      totalFacts: this.factDefinitions.size,
      keyFacts: ['eventType', 'market', 'context.storeId']
    });
  }

  addFact(name, factFunction) {
    this.factDefinitions.set(name, factFunction);
  }

  removeFact(name) {
    this.factDefinitions.delete(name);
  }

  getAvailableFacts() {
    return Array.from(this.factDefinitions.keys());
  }

  validateFactsForRules(rules) {
    const definedFacts = this.getAvailableFacts();
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
      if (condition.all) condition.all.forEach(checkCondition);
      if (condition.any) condition.any.forEach(checkCondition);
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
