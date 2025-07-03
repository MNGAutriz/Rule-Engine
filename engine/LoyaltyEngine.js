const { Engine } = require('json-rules-engine');
const consumerService = require('../services/consumerService');
const CampaignService = require('../services/CampaignService');
const FactsEngine = require('./FactsEngine');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Main Loyalty Engine - Orchestrates rule evaluation and point calculation
 * Follows json-rules-engine patterns with proper event-driven architecture
 * Strictly adheres to generalized input/output templates
 */
class LoyaltyEngine {
  constructor() {
    this.campaignService = new CampaignService();
    this.factsEngine = new FactsEngine();
    this.engine = new Engine();
    this.pointBreakdown = [];
    this.errors = [];
    this.currentEventData = null; // Store current event data for handlers
    this.initialized = false; // Track initialization state
  }

  /**
   * Initialize the engine with facts, rules, and event handlers
   * Following json-rules-engine patterns strictly
   */
  async initializeEngine() {
    if (this.initialized) return; // Prevent double initialization
    
    // Add facts to engine
    await this.factsEngine.addFactsToEngine(this.engine);
    
    // Load rules from JSON files
    await this.loadRulesFromFiles();
    
    // Initialize event handlers (pure event-driven approach)
    this.initializeEventHandlers();
    
    this.initialized = true;
    console.log('✅ Loyalty Engine initialized with json-rules-engine patterns');
  }

  /**
   * Load rules from JSON files in the rules directory
   */
  async loadRulesFromFiles() {
    const rulesDir = path.join(__dirname, '../rules');
    
    if (!fs.existsSync(rulesDir)) {
      console.warn('Rules directory not found, creating default rules...');
      await this.createDefaultRules();
      return;
    }

    const ruleFiles = fs.readdirSync(rulesDir).filter(file => file.endsWith('.json'));
    
    for (const file of ruleFiles) {
      const filePath = path.join(rulesDir, file);
      try {
        const rulesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Add each rule to the engine
        for (const rule of rulesData) {
          this.engine.addRule(rule);
        }
        
        console.log(`✅ Loaded rules from ${file}`);
      } catch (error) {
        console.error(`Error loading rules from ${file}:`, error);
      }
    }
  }

  /**
   * Initialize event handlers following json-rules-engine event-driven patterns
   * Dynamic event handlers that calculate points based on rule parameters
   */
  initializeEventHandlers() {
    // Universal event handler for all rule types
    // This follows the json-rules-engine pattern where events are data-driven
    this.engine.on('INTERACTION_REGISTRY_POINT', this.createDynamicEventHandler('INTERACTION_REGISTRY_POINT'));
    this.engine.on('ORDER_BASE_POINT', this.createDynamicEventHandler('ORDER_BASE_POINT'));
    this.engine.on('ORDER_MULTIPLE_POINT', this.createDynamicEventHandler('ORDER_MULTIPLE_POINT'));
    this.engine.on('FLEXIBLE_CAMPAIGN_BONUS', this.createDynamicEventHandler('FLEXIBLE_CAMPAIGN_BONUS'));
    this.engine.on('FLEXIBLE_VIP_MULTIPLIER', this.createDynamicEventHandler('FLEXIBLE_VIP_MULTIPLIER'));
    this.engine.on('FLEXIBLE_BASKET_AMOUNT', this.createDynamicEventHandler('FLEXIBLE_BASKET_AMOUNT'));
    this.engine.on('FLEXIBLE_PRODUCT_MULTIPLIER', this.createDynamicEventHandler('FLEXIBLE_PRODUCT_MULTIPLIER'));
    this.engine.on('FLEXIBLE_COMBO_PRODUCT_MULTIPLIER', this.createDynamicEventHandler('FLEXIBLE_COMBO_PRODUCT_MULTIPLIER'));
    this.engine.on('INTERACTION_ADJUST_POINT_TIMES_PER_YEAR', this.createDynamicEventHandler('INTERACTION_ADJUST_POINT_TIMES_PER_YEAR'));
    this.engine.on('INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS', this.createDynamicEventHandler('INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS'));
    this.engine.on('FIRST_PURCHASE_BIRTH_MONTH_BONUS', this.createDynamicEventHandler('FIRST_PURCHASE_BIRTH_MONTH_BONUS'));
    this.engine.on('INTERACTION_ADJUST_POINT_BY_MANAGER', this.createDynamicEventHandler('INTERACTION_ADJUST_POINT_BY_MANAGER'));
    this.engine.on('GIFT_REDEEM', this.createDynamicEventHandler('GIFT_REDEEM'));
    this.engine.on('LOYALTY_BURN', this.createDynamicEventHandler('LOYALTY_BURN'));

    // Generic success handler for logging
    this.engine.on('success', (event, almanac, ruleResult) => {
      console.log(`✅ Rule triggered: ${event.type}`, {
        params: event.params,
        rule: ruleResult?.rule?.name || ruleResult?.name || 'Unnamed rule'
      });
    });

    // Add fact definitions to the engine immediately
    this.engine.addFact('params', (params, almanac) => {
      return params;
    });
  }

  /**
   * Create a dynamic event handler that calculates points based on rule parameters
   * This is the core of the data-driven approach - no hardcoded logic
   */
  createDynamicEventHandler(eventType) {
    return async (event, almanac) => {
      try {
        const market = await almanac.factValue('market');
        
        // Get data from the current event data stored during processing
        const eventData = this.currentEventData || {};
        const amount = eventData.attributes?.amount || 0;
        const srpAmount = eventData.attributes?.srpAmount || 0;
        const recycledCount = eventData.attributes?.recycledCount || 0;
        const adjustedPoints = eventData.attributes?.adjustedPoints || 0;
        const giftValue = eventData.attributes?.giftValue || 0;
        const burnAmount = eventData.attributes?.burnAmount || 0;
        
        console.log(`Processing ${eventType} - market: ${market}, amount: ${amount}, srpAmount: ${srpAmount}`);
        
        let points = 0;
        const params = event; // In json-rules-engine, the event object IS the params
        
        // Calculate points based on event type and parameters
        switch (eventType) {
          case 'INTERACTION_REGISTRY_POINT':
            points = this.calculateRegistrationPoints(market, params);
            break;
            
          case 'ORDER_BASE_POINT':
            points = this.calculateBasePoints(market, amount, srpAmount, params);
            break;
            
          case 'ORDER_MULTIPLE_POINT':
            points = this.calculateMultipleOrderPoints(market, amount, srpAmount, params);
            break;
            
          case 'FLEXIBLE_CAMPAIGN_BONUS':
            points = this.calculateCampaignBonus(market, amount, srpAmount, params);
            break;
            
          case 'FLEXIBLE_VIP_MULTIPLIER':
            points = this.calculateVIPMultiplier(market, amount, srpAmount, params);
            break;
            
          case 'FLEXIBLE_BASKET_AMOUNT':
            points = this.calculateBasketThreshold(market, srpAmount, params);
            break;
            
          case 'FLEXIBLE_PRODUCT_MULTIPLIER':
            points = this.calculateProductMultiplier(market, amount, srpAmount, params);
            break;
            
          case 'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER':
            points = this.calculateComboBonus(market, params);
            break;
            
          case 'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR':
            points = this.calculateRecyclingPoints(market, recycledCount, params);
            break;
            
          case 'INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS':
            points = this.calculateSkinTestPoints(market, params);
            break;
            
          case 'ADJUSTMENT_MANUAL_POINT':
            points = this.calculateManualAdjustment(market, params);
            break;
            
          case 'FIRST_PURCHASE_BIRTH_MONTH_BONUS':
            points = this.calculateBirthMonthBonus(market, amount, srpAmount, params);
            break;
            
          case 'INTERACTION_ADJUST_POINT_BY_MANAGER':
            points = adjustedPoints;
            break;
            
          case 'GIFT_REDEEM':
            points = -Math.abs(giftValue);
            break;
            
          case 'LOYALTY_BURN':
            points = -Math.abs(burnAmount);
            break;
            
          default:
            console.warn(`Unknown event type: ${eventType}`);
            points = 0;
        }
        
        console.log(`Calculated ${points} points for ${eventType}`);
        
        // Add to breakdown with proper campaign information
        this.addToBreakdown(eventType, points, this.getDescription(eventType, market, points), params);
        
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
        this.addError(`Failed to process ${eventType}: ${error.message}`);
      }
    };
  }

  /**
   * Process an event through the rules engine
   * Follows the generalized input/output template exactly
   */
  async processEvent(eventData) {
    try {
      // Ensure engine is initialized before processing
      if (!this.initialized) {
        await this.initializeEngine();
      }
      
      console.log('Processing event:', eventData.eventId, 'for consumer:', eventData.consumerId);
      
      // Validate event data according to generalized input template
      this.validateEventData(eventData);
      
      // Set consumer market if provided in event data
      if (eventData.market) {
        await consumerService.setConsumerMarket(eventData.consumerId, eventData.market);
      }
      
      // Reset breakdown and errors for this processing
      this.pointBreakdown = [];
      this.errors = [];
      
      // Store current event data for use in event handlers
      this.currentEventData = eventData;
      
      // Run the engine with the event data - strictly following json-rules-engine patterns
      const engineResults = await this.engine.run(eventData);
      console.log('Engine run completed. Events triggered:', engineResults.events.length);
      
      // Calculate total points from breakdown
      const totalPointsAwarded = this.pointBreakdown.reduce((sum, item) => sum + item.points, 0);
      
      // Get current consumer balance and update it
      const currentBalance = await consumerService.getBalance(eventData.consumerId);
      const newTotal = currentBalance.total + totalPointsAwarded;
      const newAvailable = Math.max(0, currentBalance.available + totalPointsAwarded);
      const newUsed = currentBalance.used;
      const newVersion = currentBalance.version + 1;
      
      // Update balance in service
      await consumerService.updateBalance(eventData.consumerId, {
        total: newTotal,
        available: newAvailable,
        used: newUsed,
        version: newVersion
      });
      
      // Build response following the exact generalized output template
      const response = {
        consumerId: eventData.consumerId,
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        totalPointsAwarded: totalPointsAwarded,
        pointBreakdown: this.pointBreakdown,
        errors: this.errors,
        resultingBalance: {
          total: newTotal,
          available: newAvailable,
          used: newUsed,
          version: newVersion
        }
      };
      
      // Log the event for audit trail
      await consumerService.logEvent({
        ...response,
        timestamp: new Date().toISOString(),
        originalEvent: eventData
      });
      
      console.log('✅ Event processed successfully:', response);
      return response;
      
    } catch (error) {
      console.error('Error processing event:', error);
      throw new Error(`Event processing failed: ${error.message}`);
    } finally {
      // Clear current event data
      this.currentEventData = null;
    }
  }

  /**
   * Validate event data according to the generalized input template
   */
  validateEventData(eventData) {
    // Required fields from generalized input template
    const requiredFields = [
      'eventId', 'eventType', 'timestamp', 'market', 
      'channel', 'productLine', 'consumerId'
    ];
    
    const missing = requiredFields.filter(field => !eventData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Validate market - only accept GitHub format codes
    const validMarkets = ['JP', 'HK', 'TW'];
    if (!validMarkets.includes(eventData.market)) {
      throw new Error(`Invalid market: ${eventData.market}. Must be one of: ${validMarkets.join(', ')}`);
    }
    
    // Validate event type
    const validEventTypes = ['PURCHASE', 'INTERACTION', 'ADJUSTMENT', 'REDEMPTION', 'REGISTRATION'];
    if (!validEventTypes.includes(eventData.eventType)) {
      throw new Error(`Invalid event type: ${eventData.eventType}. Must be one of: ${validEventTypes.join(', ')}`);
    }
    
    // Validate timestamp format (should be ISO 8601)
    if (isNaN(Date.parse(eventData.timestamp))) {
      throw new Error(`Invalid timestamp format: ${eventData.timestamp}. Must be ISO 8601 format`);
    }
    
    // Validate context object exists (can be empty)
    if (!eventData.context) {
      eventData.context = {};
    }
    
    // Validate attributes object exists (can be empty)
    if (!eventData.attributes) {
      eventData.attributes = {};
    }
    
    return true;
  }

  /**
   * Data-driven point calculation methods
   * These methods calculate points based on parameters from rules, not hardcoded logic
   */
  calculateRegistrationPoints(market, params) {
    if (market === 'JP') {
      return Math.floor(params.registrationBonus || 150);
    }
    return Math.floor(params.registrationBonus || 0);
  }

  calculateBasePoints(market, amount, srpAmount, params) {
    if (market === 'JP') {
      const rate = params.jpRate || 0.1;
      const result = Math.floor(amount * rate);
      return result;
    } else if (market === 'HK' || market === 'TW') {
      const baseAmount = srpAmount || amount;
      const rate = params.rate || 1.0;
      const result = Math.floor(baseAmount * rate);
      return result;
    }
    return 0;
  }

  calculateMultipleOrderPoints(market, amount, srpAmount, params) {
    if (market === 'JP') {
      const basePoints = Math.floor(amount * (params.jpRate || 0.1));
      const multiplier = params.multiplier || 2.0;
      return Math.floor(basePoints * (multiplier - 1.0));
    } else {
      return Math.floor(params.multipleOrderBonus || 0);
    }
  }

  calculateCampaignBonus(market, amount, srpAmount, params) {
    if (market === 'JP') {
      const multiplier = params.multiplier || 1.5;
      const basePoints = Math.floor(amount * (params.jpRate || 0.1));
      return Math.floor(basePoints * (multiplier - 1.0));
    } else {
      return Math.floor(params.fixedBonus || 0);
    }
  }

  calculateVIPMultiplier(market, amount, srpAmount, params) {
    if (market === 'HK' || market === 'TW') {
      const multiplier = params.multiplier || 2.0;
      const baseAmount = srpAmount || amount;
      const basePoints = Math.floor(baseAmount);
      return Math.floor(basePoints * (multiplier - 1.0));
    }
    return 0;
  }

  calculateBasketThreshold(market, srpAmount, params) {
    if (market === 'HK' || market === 'TW') {
      const threshold = params.threshold || 5000;
      const bonus = params.bonus || 200;
      
      if (srpAmount >= threshold) {
        return Math.floor(bonus);
      }
    }
    return 0;
  }

  calculateProductMultiplier(market, amount, srpAmount, params) {
    if (market === 'HK' || market === 'TW') {
      const multiplier = params.multiplier || 1.5;
      const baseAmount = srpAmount || amount;
      const basePoints = Math.floor(baseAmount);
      return Math.floor(basePoints * (multiplier - 1.0));
    }
    return 0;
  }

  calculateComboBonus(market, params) {
    if (market === 'HK' || market === 'TW') {
      return Math.floor(params.bonus || 250);
    }
    return 0;
  }

  calculateRecyclingPoints(market, recycledCount, params) {
    if (market === 'JP') {
      const maxBottlesPerYear = params.maxPerYear || 5;
      const pointsPerBottle = params.pointsPerBottle || 50;
      const actualCount = Math.min(recycledCount, maxBottlesPerYear);
      return Math.floor(actualCount * pointsPerBottle);
    } else {
      const pointsPerBottle = params.pointsPerBottle || 50;
      return Math.floor(recycledCount * pointsPerBottle);
    }
  }

  calculateSkinTestPoints(market, params) {
    if (market === 'JP') {
      return Math.floor(params.skinTestBonus || 75);
    } else {
      return Math.floor(params.skinTestBonus || 75);
    }
  }

  calculateManualAdjustment(market, params) {
    const eventData = this.currentEventData;
    const adjustedPoints = eventData?.attributes?.adjustedPoints || 0;
    return Math.floor(adjustedPoints);
  }

  calculateBirthMonthBonus(market, amount, srpAmount, params) {
    if (market === 'HK' || market === 'TW') {
      const baseAmount = srpAmount || amount;
      const bonusPercentage = params.bonusPercentage || 0.1;
      return Math.floor(baseAmount * bonusPercentage);
    }
    return 0;
  }

  /**
   * Add a point calculation to the breakdown array
   * Following the exact generalized output template
   */
  addToBreakdown(ruleId, points, description, params) {
    const breakdown = {
      ruleId: ruleId,
      points: Math.floor(points),
      description: description || `${ruleId} applied`
    };

    // Add campaign information if available in params
    if (params && params.campaignId) {
      breakdown.campaignId = params.campaignId;
    }
    if (params && params.campaignCode) {
      breakdown.campaignCode = params.campaignCode;
    }
    if (params && params.campaignStart) {
      breakdown.campaignStart = params.campaignStart;
    }
    if (params && params.campaignEnd) {
      breakdown.campaignEnd = params.campaignEnd;
    }

    this.pointBreakdown.push(breakdown);
  }

  /**
   * Generate description for a rule based on context
   */
  getDescription(ruleId, market, points) {
    const descriptions = {
      'INTERACTION_REGISTRY_POINT': `Registration bonus for ${market} market`,
      'ORDER_BASE_POINT': `Base purchase points for ${market} market`,
      'ORDER_MULTIPLE_POINT': `Multiple purchase bonus for ${market} market`,
      'FLEXIBLE_CAMPAIGN_BONUS': `Campaign bonus for ${market} market`,
      'FLEXIBLE_VIP_MULTIPLIER': `VIP multiplier for ${market} market`,
      'FLEXIBLE_BASKET_AMOUNT': `Basket threshold bonus for ${market} market`,
      'FLEXIBLE_PRODUCT_MULTIPLIER': `Product multiplier for ${market} market`,
      'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER': `Combo product bonus for ${market} market`,
      'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR': `Recycling bonus for ${market} market`,
      'INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS': `Skin test bonus for ${market} market`,
      'FIRST_PURCHASE_BIRTH_MONTH_BONUS': `Birth month bonus for ${market} market`,
      'INTERACTION_ADJUST_POINT_BY_MANAGER': 'Manual adjustment',
      'GIFT_REDEEM': 'Gift redemption',
      'LOYALTY_BURN': 'Points burned'
    };

    return descriptions[ruleId] || `${ruleId} applied`;
  }

  /**
   * Create default rules if none exist
   */
  async createDefaultRules() {
    const rulesDir = path.join(__dirname, '../rules');
    
    // Ensure rules directory exists
    if (!fs.existsSync(rulesDir)) {
      fs.mkdirSync(rulesDir, { recursive: true });
    }

    // Create default base rules
    const defaultBaseRules = [
      {
        name: "Registration Bonus - JP",
        conditions: {
          all: [
            { "fact": "eventType", "operator": "equal", "value": "INTERACTION" },
            { "fact": "market", "operator": "equal", "value": "JP" }
          ]
        },
        event: {
          type: "INTERACTION_REGISTRY_POINT",
          params: {
            registrationBonus: 150,
            description: "Registration bonus for JP market"
          }
        },
        priority: 10
      },
      {
        name: "Base Purchase Points - JP",
        conditions: {
          all: [
            { "fact": "eventType", "operator": "equal", "value": "PURCHASE" },
            { "fact": "market", "operator": "equal", "value": "JP" }
          ]
        },
        event: {
          type: "ORDER_BASE_POINT",
          params: {
            jpRate: 0.1,
            description: "Base purchase points for JP market"
          }
        },
        priority: 10
      },
      {
        name: "Base Purchase Points - HK/TW",
        conditions: {
          all: [
            { "fact": "eventType", "operator": "equal", "value": "PURCHASE" },
            { "fact": "market", "operator": "in", "value": ["HK", "TW"] }
          ]
        },
        event: {
          type: "ORDER_BASE_POINT",
          params: {
            rate: 1.0,
            description: "Base purchase points for HK/TW market"
          }
        },
        priority: 10
      }
    ];

    // Write default rules to file
    const defaultRulesPath = path.join(rulesDir, 'default-rules.json');
    fs.writeFileSync(defaultRulesPath, JSON.stringify(defaultBaseRules, null, 2));

    // Load the default rules
    for (const rule of defaultBaseRules) {
      this.engine.addRule(rule);
    }

    console.log('✅ Created and loaded default rules');
  }

  /**
   * Add or update a point calculation strategy
   */
  addPointCalculationStrategy(eventType, market, strategy) {
    if (!this.pointCalculationStrategies.has(eventType)) {
      this.pointCalculationStrategies.set(eventType, {});
    }
    this.pointCalculationStrategies.get(eventType)[market] = strategy;
    console.log(`✅ Added strategy for ${eventType} in ${market}`);
  }

  /**
   * Remove a point calculation strategy
   */
  removePointCalculationStrategy(eventType, market) {
    const strategies = this.pointCalculationStrategies.get(eventType);
    if (strategies && strategies[market]) {
      delete strategies[market];
      console.log(`✅ Removed strategy for ${eventType} in ${market}`);
    }
  }

  /**
   * Get available strategies
   */
  getAvailableStrategies() {
    const strategies = {};
    for (const [eventType, marketStrategies] of this.pointCalculationStrategies) {
      strategies[eventType] = Object.keys(marketStrategies);
    }
    return strategies;
  }

  /**
   * Add a new rule to the engine dynamically
   */
  addRule(rule) {
    this.engine.addRule(rule);
    console.log(`✅ Added rule: ${rule.name || 'Unnamed rule'}`);
  }

  /**
   * Remove a rule from the engine
   */
  removeRule(ruleId) {
    this.engine.removeRule(ruleId);
    console.log(`✅ Removed rule: ${ruleId}`);
  }

  /**
   * Get all available facts
   */
  getEngineFacts() {
    return this.factsEngine.getAvailableFacts();
  }

  /**
   * Add error to the errors array
   */
  addError(error) {
    this.errors.push(error);
    console.warn(`Added error: ${error}`);
  }

  /**
   * Get active campaigns for a specific market and time
   */
  async getActiveCampaigns(market, timestamp = new Date().toISOString()) {
    try {
      return await this.campaignService.getActiveCampaigns(market, timestamp);
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      return [];
    }
  }

  /**
   * Process multiple events in batch
   */
  async processEvents(events) {
    const results = [];
    
    for (const eventData of events) {
      try {
        const result = await this.processEvent(eventData);
        results.push(result);
      } catch (error) {
        console.error(`Error processing event ${eventData.eventId}:`, error);
        results.push({
          eventId: eventData.eventId,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Clear engine state (useful for testing)
   */
  clearState() {
    this.pointBreakdown = [];
    this.errors = [];
    console.log('✅ Engine state cleared');
  }

  /**
   * Get engine statistics
   */
  getEngineStats() {
    return {
      totalRules: this.engine.rules.length,
      totalFacts: this.factsEngine.getAvailableFacts().length,
      lastProcessed: new Date().toISOString()
    };
  }
}

module.exports = LoyaltyEngine;