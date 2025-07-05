const { Engine } = require('json-rules-engine');
const consumerService = require('../services/consumerService');
const CampaignService = require('../services/CampaignService');
const FactsEngine = require('./FactsEngine');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Main Rules Engine - Orchestrates rule evaluation and point calculation
 * Follows json-rules-engine patterns with proper event-driven architecture
 * Flexible and market-agnostic design for global scalability
 */
class RulesEngine {
  constructor() {
    this.campaignService = new CampaignService();
    this.factsEngine = new FactsEngine();
    this.engine = new Engine();
    this.rewardBreakdown = [];
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
    console.log('Rules Engine initialized with json-rules-engine patterns');
  }

  /**
   * Load rules from JSON files in the rules directory
   * All rules must be defined in JSON files 
   */
  async loadRulesFromFiles() {
    const rulesDir = path.join(__dirname, '../rules');
    
    if (!fs.existsSync(rulesDir)) {
      throw new Error('Rules directory not found. Please create the rules directory with JSON rule files.');
    }

    const ruleFiles = fs.readdirSync(rulesDir).filter(file => file.endsWith('.json'));
    
    if (ruleFiles.length === 0) {
      throw new Error('No rule files found in rules directory. Please add JSON rule files.');
    }
    
    for (const file of ruleFiles) {
      const filePath = path.join(rulesDir, file);
      try {
        const rulesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Add each rule to the engine
        for (const rule of rulesData) {
          this.engine.addRule(rule);
        }
        
        console.log(`Loaded rules from ${file}`);
      } catch (error) {
        console.error(`Error loading rules from ${file}:`, error);
        throw new Error(`Failed to load rules from ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Initialize event handlers following json-rules-engine event-driven patterns
   * Only handlers for the 9 core event types we support
   */
  initializeEventHandlers() {
    // Core event handlers for the 9 supported event types
    this.engine.on('INTERACTION_REGISTRY_POINT', this.createDynamicEventHandler('INTERACTION_REGISTRY_POINT'));
    this.engine.on('ORDER_BASE_POINT', this.createDynamicEventHandler('ORDER_BASE_POINT'));
    this.engine.on('ORDER_MULTIPLE_POINT_LIMIT', this.createDynamicEventHandler('ORDER_MULTIPLE_POINT_LIMIT'));
    this.engine.on('FLEXIBLE_CAMPAIGN_BONUS', this.createDynamicEventHandler('FLEXIBLE_CAMPAIGN_BONUS'));
    this.engine.on('FLEXIBLE_VIP_MULTIPLIER', this.createDynamicEventHandler('FLEXIBLE_VIP_MULTIPLIER'));
    this.engine.on('FLEXIBLE_BASKET_AMOUNT', this.createDynamicEventHandler('FLEXIBLE_BASKET_AMOUNT'));
    this.engine.on('FLEXIBLE_PRODUCT_MULTIPLIER', this.createDynamicEventHandler('FLEXIBLE_PRODUCT_MULTIPLIER'));
    this.engine.on('FLEXIBLE_COMBO_PRODUCT_MULTIPLIER', this.createDynamicEventHandler('FLEXIBLE_COMBO_PRODUCT_MULTIPLIER'));
    this.engine.on('INTERACTION_ADJUST_POINT_TIMES_PER_YEAR', this.createDynamicEventHandler('INTERACTION_ADJUST_POINT_TIMES_PER_YEAR'));
    this.engine.on('FIRST_PURCHASE_BIRTH_MONTH_BONUS', this.createDynamicEventHandler('FIRST_PURCHASE_BIRTH_MONTH_BONUS'));
    this.engine.on('INTERACTION_ADJUST_POINT_BY_MANAGER', this.createDynamicEventHandler('INTERACTION_ADJUST_POINT_BY_MANAGER'));

    // Generic success handler for logging
    this.engine.on('success', (event, almanac, ruleResult) => {
      console.log(`Rule triggered: ${event.type}`, {
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
   * Create a dynamic event handler that calculates rewards based on rule parameters
   * This is the core of the flexible, market-agnostic approach 
   */
  createDynamicEventHandler(eventType) {
    return async (event, almanac) => {
      try {
        const market = await almanac.factValue('market');
        
        // Get data from the current event data stored during processing
        const eventData = this.currentEventData || {};
        const baseAmount = eventData.attributes?.amount || 0;
        const discountedAmount = eventData.attributes?.srpAmount || 0;
        const itemCount = eventData.attributes?.recycledCount || 0;
        const adjustmentValue = eventData.attributes?.adjustedPoints || 0;
        
        console.log(`Processing ${eventType} - market: ${market}, baseAmount: ${baseAmount}, discountedAmount: ${discountedAmount}`);
        
        let rewardPoints = 0;
        const params = event; // In json-rules-engine, the event object IS the params
        
        // Calculate rewards based on event type and parameters
        switch (eventType) {
          case 'INTERACTION_REGISTRY_POINT':
            rewardPoints = this.calculateRegistrationReward(market, params);
            break;
            
          case 'ORDER_BASE_POINT':
            rewardPoints = this.calculateBaseReward(market, baseAmount, discountedAmount, params);
            break;
            
          case 'ORDER_MULTIPLE_POINT_LIMIT':
            rewardPoints = this.calculateMultiplierReward(market, baseAmount, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_CAMPAIGN_BONUS':
            rewardPoints = this.calculateCampaignReward(market, baseAmount, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_VIP_MULTIPLIER':
            rewardPoints = this.calculateTierMultiplier(market, baseAmount, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_BASKET_AMOUNT':
            rewardPoints = this.calculateThresholdReward(market, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_PRODUCT_MULTIPLIER':
            rewardPoints = this.calculateProductReward(market, baseAmount, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER':
            rewardPoints = this.calculateComboReward(market, params);
            break;
            
          case 'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR':
            rewardPoints = this.calculateActivityReward(market, itemCount, params);
            break;
            
          case 'FIRST_PURCHASE_BIRTH_MONTH_BONUS':
            rewardPoints = this.calculateTimedBonus(market, baseAmount, discountedAmount, params);
            break;
            
          case 'INTERACTION_ADJUST_POINT_BY_MANAGER':
            rewardPoints = adjustmentValue;
            break;
            
          default:
            console.warn(`Unknown event type: ${eventType}`);
            rewardPoints = 0;
        }
        
        console.log(`Calculated ${rewardPoints} reward points for ${eventType}`);
        
        // Add to breakdown with proper campaign information
        this.addToBreakdown(eventType, rewardPoints, this.getDescription(eventType, market, rewardPoints), params);
        
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
      this.rewardBreakdown = [];
      this.errors = [];
      
      // Store current event data for use in event handlers
      this.currentEventData = eventData;
      
      // Run the engine with the event data - strictly following json-rules-engine patterns
      const engineResults = await this.engine.run(eventData);
      console.log('Engine run completed. Events triggered:', engineResults.events.length);
      
      // Calculate total points from breakdown
      const totalRewardsAwarded = this.rewardBreakdown.reduce((sum, item) => sum + item.points, 0);
      
      // Get current consumer balance and update it
      const currentBalance = await consumerService.getBalance(eventData.consumerId);
      const newTotal = currentBalance.total + totalRewardsAwarded;
      const newAvailable = Math.max(0, currentBalance.available + totalRewardsAwarded);
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
        totalPointsAwarded: totalRewardsAwarded,
        pointBreakdown: this.rewardBreakdown,
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
    
    // Validate market
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
   * Flexible reward calculation methods
   * These methods calculate rewards based purely on parameters from rules
   * Market-agnostic and data-driven approach for global scalability
   */
  calculateRegistrationReward(market, params) {
    return Math.floor(params.registrationBonus || params.fixedReward || 0);
  }

  calculateBaseReward(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    const rewardRate = params.rate || params.jpRate || params.conversionRate || 0;
    return Math.floor(calculationAmount * rewardRate);
  }

  calculateMultiplierReward(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    const baseRate = params.baseRate || params.jpRate || params.rate || 0;
    const baseReward = Math.floor(calculationAmount * baseRate);
    const multiplier = params.multiplier || 1.0;
    return Math.floor(baseReward * (multiplier - 1.0));
  }

  calculateCampaignReward(market, baseAmount, discountedAmount, params) {
    // Support both fixed bonus and multiplier approaches
    if (params.fixedBonus !== undefined) {
      return Math.floor(params.fixedBonus);
    } else {
      const calculationAmount = discountedAmount || baseAmount;
      const baseRate = params.baseRate || params.jpRate || params.rate || 0;
      const baseReward = Math.floor(calculationAmount * baseRate);
      const multiplier = params.multiplier || 1.0;
      return Math.floor(baseReward * (multiplier - 1.0));
    }
  }

  calculateTierMultiplier(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    const baseRate = params.baseRate || params.rate || 1.0;
    const baseReward = Math.floor(calculationAmount * baseRate);
    const multiplier = params.multiplier || 1.0;
    return Math.floor(baseReward * (multiplier - 1.0));
  }

  calculateThresholdReward(market, discountedAmount, params) {
    const threshold = params.threshold || 0;
    const bonus = params.bonus || params.reward || 0;
    
    if (discountedAmount >= threshold) {
      return Math.floor(bonus);
    }
    return 0;
  }

  calculateProductReward(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    const baseRate = params.baseRate || params.rate || 1.0;
    const baseReward = Math.floor(calculationAmount * baseRate);
    const multiplier = params.multiplier || 1.0;
    return Math.floor(baseReward * (multiplier - 1.0));
  }

  calculateComboReward(market, params) {
    return Math.floor(params.bonus || params.reward || params.fixedBonus || 0);
  }

  calculateActivityReward(market, itemCount, params) {
    const maxItemsPerPeriod = params.maxPerYear || params.maxPerPeriod || itemCount;
    const rewardPerItem = params.pointsPerBottle || params.rewardPerItem || params.rewardPerActivity || 0;
    const actualCount = Math.min(itemCount, maxItemsPerPeriod);
    return Math.floor(actualCount * rewardPerItem);
  }

  calculateTimedBonus(market, baseAmount, discountedAmount, params) {
    const calculationAmount = discountedAmount || baseAmount;
    const baseRate = params.baseRate || params.jpRate || params.rate || 1.0;
    const baseReward = Math.floor(calculationAmount * baseRate);
    const multiplier = params.multiplier || 1.0;
    return Math.floor(baseReward * (multiplier - 1.0));
  }

  /**
   * Add a reward calculation to the breakdown array
   * Following the exact generalized output template
   */
  addToBreakdown(ruleId, rewardPoints, description, params) {
    const breakdown = {
      ruleId: ruleId,
      points: Math.floor(rewardPoints),
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

    this.rewardBreakdown.push(breakdown);
  }

  /**
   * Generate description for a rule based on context
   */
  getDescription(ruleId, market, rewardPoints) {
    const descriptions = {
      'INTERACTION_REGISTRY_POINT': `Registration reward for ${market} market`,
      'ORDER_BASE_POINT': `Base transaction reward for ${market} market`,
      'ORDER_MULTIPLE_POINT_LIMIT': `Campaign multiplier for ${market} market`,
      'FLEXIBLE_CAMPAIGN_BONUS': `Campaign reward for ${market} market`,
      'FLEXIBLE_VIP_MULTIPLIER': `Tier-based multiplier for ${market} market`,
      'FLEXIBLE_BASKET_AMOUNT': `Threshold reward for ${market} market`,
      'FLEXIBLE_PRODUCT_MULTIPLIER': `Product-based reward for ${market} market`,
      'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER': `Combination reward for ${market} market`,
      'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR': `Activity-based reward for ${market} market`,
      'FIRST_PURCHASE_BIRTH_MONTH_BONUS': `Timed bonus for ${market} market`,
      'INTERACTION_ADJUST_POINT_BY_MANAGER': 'Manual adjustment'
    };

    return descriptions[ruleId] || `${ruleId} applied`;
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
    this.rewardBreakdown = [];
    this.errors = [];
    console.log('Engine state cleared');
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

module.exports = RulesEngine;