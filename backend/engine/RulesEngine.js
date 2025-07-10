const { Engine } = require('json-rules-engine');
const consumerService = require('../services/consumerService');
const CDPService = require('../services/CDPService');
const CampaignService = require('../services/CampaignService');
const FactsEngine = require('./FactsEngine');
const CalculationHelpers = require('./helpers/CalculationHelpers');
const ValidationHelpers = require('./helpers/ValidationHelpers');
const FormattingHelpers = require('./helpers/FormattingHelpers');
const { logger } = require('../src/utils');
const fs = require('fs');
const path = require('path');

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
    this.currentEnrichedEventData = null; // Store current enriched event data for handlers
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
    logger.info('Rules Engine initialized with json-rules-engine patterns');
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
        
        logger.info(`Loaded ${rulesData.length} rules from ${file}`);
      } catch (error) {
        logger.error(`Error loading rules from ${file}`, error);
        throw new Error(`Failed to load rules from ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Dynamically initialize event handlers based on the event types found in loaded rules
   * This method scans all loaded rules and creates handlers for any event types it finds
   */
  initializeEventHandlers() {
    // Get all unique event types from loaded rules
    const eventTypes = this.getEventTypesFromRules();
    
    logger.debug('Discovered event types from rules', { 
      eventTypes: Array.from(eventTypes),
      totalRules: this.engine.rules.length 
    });
    
    // Create dynamic handlers for each discovered event type
    eventTypes.forEach(eventType => {
      this.engine.on(eventType, this.createDynamicEventHandler(eventType));
      logger.debug(`Registered dynamic handler for event type: ${eventType}`);
    });

    // Generic success handler for logging
    this.engine.on('success', (event, almanac, ruleResult) => {
      logger.debug('Rule triggered', {
        eventType: event.type,
        params: event.params,
        rule: ruleResult?.rule?.name || ruleResult?.name || 'Unnamed rule'
      });
    });

    // Add fact definitions to the engine immediately
    this.engine.addFact('params', (params, almanac) => {
      return params;
    });
    
    logger.info(`Dynamically initialized ${eventTypes.size} event handlers`);
  }

  /**
   * Extract all unique event types from the loaded rules
   * Scans through all rules and collects event.type values
   */
  getEventTypesFromRules() {
    const eventTypes = new Set();
    
    // Iterate through all loaded rules and extract event types
    this.engine.rules.forEach((rule) => {
      let eventType = null;
      
      // Access event type via ruleEvent (json-rules-engine internal structure)
      if (rule.ruleEvent && rule.ruleEvent.type) {
        eventType = rule.ruleEvent.type;
      }
      
      // Fallback: try accessing via toJSON() if ruleEvent doesn't work
      if (!eventType && typeof rule.toJSON === 'function') {
        const ruleData = rule.toJSON();
        if (ruleData.event && ruleData.event.type) {
          eventType = ruleData.event.type;
        }
      }
      
      // Add to set if found
      if (eventType) {
        eventTypes.add(eventType);
      }
    });
    
    return eventTypes;
  }

  /**
   * Create a dynamic event handler that calculates rewards based on rule parameters
   * This is the core of the flexible, market-agnostic approach 
   */
  createDynamicEventHandler(eventType) {
    // Use arrow function to preserve 'this' context
    return async (event, almanac) => {
      try {
        const market = await almanac.factValue('market');
        
        // Get transaction amounts from facts (more reliable for async handlers)
        const baseAmount = await almanac.factValue('transactionAmount');
        const discountedAmount = await almanac.factValue('discountedAmount');
        
        // Get data from the current enriched event data stored during processing (for other attributes)
        const enrichedEventData = (this && this.currentEnrichedEventData) || {};
        const itemCount = enrichedEventData.attributes?.recycledCount || 0;
        const adjustmentValue = enrichedEventData.attributes?.adjustmentPoints || enrichedEventData.attributes?.adjustedPoints || enrichedEventData.attributes?.adjustmentAmount || 0;
        
        logger.debug('Processing rule event', {
          eventType,
          market,
          baseAmount,
          discountedAmount,
          itemCount,
          adjustmentValue
        });

        const params = event; // In json-rules-engine, the event object IS the params
        
        // DYNAMIC CALCULATION: Use the calculation method specified in the rule parameters
        let rewardPoints = 0;
        
        if (params.calculationMethod) {
          // Use the specified calculation method from the rule
          rewardPoints = await this.calculateRewardDynamically(params.calculationMethod, {
            market,
            baseAmount,
            discountedAmount,
            itemCount,
            adjustmentValue,
            params,
            enrichedEventData
          });
        } else {
          // Fallback to simple calculations for backward compatibility
          rewardPoints = this.calculateSimpleReward(params, {
            market,
            baseAmount,
            discountedAmount,
            itemCount,
            adjustmentValue
          });
        }
        
        logger.debug('Calculated reward points', { eventType, rewardPoints });
        
        // Add to breakdown with proper campaign information
        this.addToBreakdown(eventType, rewardPoints, FormattingHelpers.getDescription(eventType, market, rewardPoints), params);
        
      } catch (error) {
        logger.error(`Error in event handler for ${eventType}`, error);
        this.addError(`Failed to process ${eventType}: ${error.message}`);
      }
    };
  }

  /**
   * Dynamic calculation method that can handle any calculation type specified in rules
   */
  async calculateRewardDynamically(calculationMethod, context) {
    const { market, baseAmount, discountedAmount, itemCount, adjustmentValue, params, enrichedEventData } = context;

    switch (calculationMethod) {
      case 'registration':
        return CalculationHelpers.calculateRegistrationReward(market, params);
      case 'base':
        return CalculationHelpers.calculateBaseReward(market, baseAmount, discountedAmount, params);
      case 'multiplier':
        return CalculationHelpers.calculateMultiplierReward(market, baseAmount, discountedAmount, params);
      case 'campaign':
        return CalculationHelpers.calculateCampaignReward(market, baseAmount, discountedAmount, params);
      case 'tier':
        return CalculationHelpers.calculateTierMultiplier(market, baseAmount, discountedAmount, params);
      case 'threshold':
        return CalculationHelpers.calculateThresholdReward(market, discountedAmount, params);
      case 'product':
        return CalculationHelpers.calculateProductReward(market, baseAmount, discountedAmount, params);
      case 'combo':
        return CalculationHelpers.calculateComboReward(market, params);
      case 'activity':
        return CalculationHelpers.calculateActivityReward(market, itemCount, params);
      case 'consultation':
        return CalculationHelpers.calculateConsultationReward(market, params);
      case 'timed_bonus':
        return CalculationHelpers.calculateTimedBonus(market, baseAmount, discountedAmount, params);
      case 'adjustment':
        return adjustmentValue;
      case 'redemption':
        const redemptionPoints = enrichedEventData.attributes?.redemptionPoints || params.redemptionPoints || 0;
        params.redemptionPoints = redemptionPoints; // Add for proper formula display
        return CalculationHelpers.calculateRedemptionDeduction(market, redemptionPoints, params);
      case 'fixed':
        return params.fixedPoints || params.bonus || 0;
      case 'percentage':
        const amount = params.useDiscounted ? discountedAmount : baseAmount;
        return Math.round((amount * (params.percentage || 0)) / 100);
      case 'formula':
        // Allow custom JavaScript formulas defined in rules (advanced feature)
        return this.evaluateFormula(params.formula, context);
      default:
        logger.warn('Unknown calculation method', { calculationMethod });
        return 0;
    }
  }

  /**
   * Simple reward calculation for backward compatibility
   * Now handles all event types properly including recycling, consultation, redemption, and adjustment
   */
  calculateSimpleReward(params, context) {
    const { baseAmount, discountedAmount, adjustmentValue, itemCount, enrichedEventData } = context;

    // Handle specific event types based on their parameters
    
    // Recycling events - INTERACTION_ADJUST_POINT_TIMES_PER_YEAR
    if (params.pointsPerBottle && itemCount > 0) {
      const pointsPerBottle = params.pointsPerBottle || 50;
      const maxPerYear = params.maxPerYear || 5;
      
      // Calculate points based on recycled count, respecting annual limit
      const totalBottles = itemCount;
      const earnedPoints = Math.min(totalBottles, maxPerYear) * pointsPerBottle;
      
      logger.debug('Recycling reward calculation', { 
        totalBottles, 
        pointsPerBottle, 
        maxPerYear, 
        earnedPoints 
      });
      
      return earnedPoints;
    }
    
    // Consultation events - CONSULTATION_BONUS
    if (params.consultationBonus) {
      return params.consultationBonus;
    }
    
    // Redemption events - REDEMPTION_DEDUCTION (negative points)
    if (params.description && params.description.includes('redeemed')) {
      const redemptionPoints = enrichedEventData?.attributes?.redemptionPoints || 
                              params.redemptionPoints || 
                              enrichedEventData?.attributes?.amount || 0;
      
      logger.debug('Redemption deduction calculation', { redemptionPoints });
      
      // Return negative value for deduction
      return -Math.abs(redemptionPoints);
    }
    
    // Manual adjustment events - INTERACTION_ADJUST_POINT_BY_MANAGER
    if (params.description && params.description.includes('adjustment')) {
      const adjustmentPoints = enrichedEventData?.attributes?.adjustedPoints || 
                              enrichedEventData?.attributes?.adjustmentPoints ||
                              adjustmentValue || 0;
      
      logger.debug('Manual adjustment calculation', { adjustmentPoints });
      
      return adjustmentPoints;
    }
    
    // Standard reward calculations (existing logic)
    if (params.fixedPoints) {
      return params.fixedPoints;
    }
    
    if (params.bonus) {
      return params.bonus;
    }
    
    if (params.multiplier && baseAmount) {
      return Math.round(baseAmount * params.multiplier);
    }
    
    if (params.percentage && baseAmount) {
      return Math.round((baseAmount * params.percentage) / 100);
    }
    
    if (params.adjustmentPoints || adjustmentValue) {
      return adjustmentValue;
    }
    
    return 0;
  }

  /**
   * Evaluate custom formulas safely (for advanced rules)
   */
  evaluateFormula(formula, context) {
    try {
      // Only allow safe mathematical operations and predefined variables
      const safeContext = {
        baseAmount: context.baseAmount || 0,
        discountedAmount: context.discountedAmount || 0,
        itemCount: context.itemCount || 0,
        Math: Math,
        round: Math.round,
        floor: Math.floor,
        ceil: Math.ceil,
        min: Math.min,
        max: Math.max
      };
      
      // Simple formula evaluation (you could use a more sophisticated parser here)
      // For now, replace variables and evaluate basic math
      let evaluableFormula = formula;
      Object.keys(safeContext).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evaluableFormula = evaluableFormula.replace(regex, safeContext[key]);
      });
      
      // Only allow safe mathematical expressions
      if (!/^[0-9+\-*/().\s]+$/.test(evaluableFormula)) {
        throw new Error('Formula contains unsafe characters');
      }
      
      return eval(evaluableFormula) || 0;
    } catch (error) {
      logger.error('Error evaluating formula', { formula, error: error.message });
      return 0;
    }
  }

  /**
   * Process an event through the rules engine with CDP enrichment
   * Follows the generalized input/output template exactly
   */
  async processEvent(eventData) {
    try {
      // Ensure engine is initialized before processing
      if (!this.initialized) {
        await this.initializeEngine();
      }
      
      logger.info('Processing event', {
        eventId: eventData.eventId,
        consumerId: eventData.consumerId,
        eventType: eventData.eventType
      });
      
      // Comprehensive validation using ValidationHelpers
      ValidationHelpers.validateCompleteEvent(eventData, consumerService);
      
      // Set consumer market if provided in event data
      if (eventData.market) {
        await consumerService.setConsumerMarket(eventData.consumerId, eventData.market);
      }
      
      // Fetch enriched consumer data from CDP with calculated attributes
      const cdpData = await CDPService.getConsumerAttributesForRules(eventData.consumerId);
      
      // Merge CDP data with event data (CDP takes precedence for consumer attributes)
      const enrichedEventData = {
        ...eventData,
        // Consumer attributes from CDP (calculated, not hardcoded)
        isVIP: cdpData.isVIP,
        isBirthMonth: cdpData.isBirthMonth,
        tier: cdpData.tier,
        tierLevel: cdpData.tierLevel,
        loyaltySegment: cdpData.loyaltySegment,
        // Use market from CDP if not provided in event
        market: eventData.market || cdpData.market,
        // Set transaction amounts from attributes for purchase calculations
        transactionAmount: eventData.attributes?.amount || 0,
        discountedAmount: eventData.attributes?.amount || 0, // No SRP, just use amount
        // Merge recycling data - for RECYCLE events, preserve event's recycledCount
        attributes: {
          ...eventData.attributes,
          recycledCount: eventData.eventType === 'RECYCLE' ? eventData.attributes?.recycledCount : cdpData.recycledCount,
          recyclingEligible: cdpData.recyclingEligible
        }
      };
      
      // Reset breakdown and errors for this processing
      this.rewardBreakdown = [];
      this.errors = [];
      
      // Store enriched event data for use in event handlers
      this.currentEnrichedEventData = enrichedEventData;
      
      // Add transaction amounts as facts for use in handlers
      this.engine.addFact('transactionAmount', enrichedEventData.transactionAmount || 0);
      this.engine.addFact('discountedAmount', enrichedEventData.discountedAmount || enrichedEventData.transactionAmount || 0);
      
      // Add basic facts to engine for rule evaluation
      this.engine.addFact('eventType', enrichedEventData.eventType);
      this.engine.addFact('market', enrichedEventData.market);
      this.engine.addFact('channel', enrichedEventData.channel);
      
      // Run the engine with the enriched event data - strictly following json-rules-engine patterns
      const engineResults = await this.engine.run(enrichedEventData);
      logger.debug('Engine run completed', {
        eventsTriggered: engineResults.events.length,
        eventTypes: engineResults.events.map(e => e.type)
      });
      
      // Calculate total points from breakdown
      const totalRewardsAwarded = this.rewardBreakdown.reduce((sum, item) => sum + item.points, 0);
      
      // Get current consumer balance and update it
      const currentBalance = await consumerService.getBalance(eventData.consumerId);
      logger.debug('Current balance before update', currentBalance);
      
      // Handle redemption vs earning differently
      let newTotal, newAvailable, newUsed;
      
      if (totalRewardsAwarded < 0) {
        // Redemption: validate sufficient points before processing
        const redemptionAmount = Math.abs(totalRewardsAwarded);
        
        // Validate sufficient available points
        if (currentBalance.available < redemptionAmount) {
          const errorMessage = `Insufficient points for redemption. Available: ${currentBalance.available}, Requested: ${redemptionAmount}`;
          logger.error(errorMessage);
          this.errors.push(errorMessage);
          
          // Return error response instead of processing
          return {
            consumerId: eventData.consumerId,
            eventId: eventData.eventId,
            eventType: eventData.eventType,
            totalPointsAwarded: 0,
            pointBreakdown: [],
            errors: this.errors,
            resultingBalance: currentBalance // Return current balance unchanged
          };
        }
        
        newTotal = currentBalance.total; // Total earned doesn't change
        newAvailable = Math.max(0, currentBalance.available - redemptionAmount);
        newUsed = currentBalance.used + redemptionAmount;
      } else {
        // Normal earning: add to total and available
        newTotal = currentBalance.total + totalRewardsAwarded;
        newAvailable = currentBalance.available + totalRewardsAwarded;
        newUsed = currentBalance.used;
      }
      
      const newTransactionCount = (currentBalance.transactionCount || 0) + 1;
      
      // Update balance in service
      await consumerService.updateBalance(eventData.consumerId, {
        total: newTotal,
        available: newAvailable,
        used: newUsed,
        transactionCount: newTransactionCount
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
          transactionCount: newTransactionCount
        }
      };
      
      // Log the event for audit trail
      await consumerService.logEvent({
        ...response,
        timestamp: new Date().toISOString(),
        originalEvent: eventData
      });
      
      logger.info('Event processed successfully', response);
      return response;
      
    } catch (error) {
      logger.error('Error processing event', error);
      throw new Error(`Event processing failed: ${error.message}`);
    } finally {
      // Clear current event data
      this.currentEnrichedEventData = null;
    }
  }

  /**
   * Add a reward calculation to the breakdown array
   * Following the exact generalized output template
   */
  addToBreakdown(ruleId, rewardPoints, description, params) {
    const breakdown = FormattingHelpers.formatBreakdownEntry(ruleId, rewardPoints, description, params);
    this.rewardBreakdown.push(breakdown);
  }

  /**
   * Add a new rule to the engine dynamically
   */
  addRule(rule) {
    this.engine.addRule(rule);
    logger.info('Dynamic rule added', { ruleName: rule.name || 'Unnamed rule' });
  }

  /**
   * Remove a rule from the engine
   */
  removeRule(ruleId) {
    this.engine.removeRule(ruleId);
    logger.info('Dynamic rule removed', { ruleId });
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
    logger.warn('Added error', { error });
  }

  /**
   * Get active campaigns for a specific market and time
   */
  async getActiveCampaigns(market, timestamp = new Date().toISOString()) {
    try {
      return await this.campaignService.getActiveCampaigns(market, timestamp);
    } catch (error) {
      logger.error('Error fetching active campaigns', error);
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
        logger.error(`Error processing event ${eventData.eventId}`, error);
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
    logger.debug('Engine state cleared');
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