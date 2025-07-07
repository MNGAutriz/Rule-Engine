const { Engine } = require('json-rules-engine');
const consumerService = require('../services/consumerService');
const CDPService = require('../services/CDPService');
const CampaignService = require('../services/CampaignService');
const FactsEngine = require('./FactsEngine');
const CalculationHelpers = require('./helpers/CalculationHelpers');
const ValidationHelpers = require('./helpers/ValidationHelpers');
const FormattingHelpers = require('./helpers/FormattingHelpers');
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
          console.log(`✅ Added rule:`, rule.event?.type, 'with conditions:', JSON.stringify(rule.conditions));
        }
        
        console.log(`Loaded rules from ${file}`);
      } catch (error) {
        console.error(`Error loading rules from ${file}:`, error);
        throw new Error(`Failed to load rules from ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Initialize event handlers for all rule types actually used in JSON files
   * Only includes handlers for event types that exist in the rule definitions
   */
  initializeEventHandlers() {
    // Core transaction event handlers (from transaction-rules.json)
    this.engine.on('INTERACTION_REGISTRY_POINT', this.createDynamicEventHandler('INTERACTION_REGISTRY_POINT'));
    this.engine.on('ORDER_BASE_POINT', this.createDynamicEventHandler('ORDER_BASE_POINT'));
    this.engine.on('ORDER_MULTIPLE_POINT_LIMIT', this.createDynamicEventHandler('ORDER_MULTIPLE_POINT_LIMIT'));
    this.engine.on('FLEXIBLE_CAMPAIGN_BONUS', this.createDynamicEventHandler('FLEXIBLE_CAMPAIGN_BONUS'));
    this.engine.on('INTERACTION_ADJUST_POINT_TIMES_PER_YEAR', this.createDynamicEventHandler('INTERACTION_ADJUST_POINT_TIMES_PER_YEAR'));
    this.engine.on('CONSULTATION_BONUS', this.createDynamicEventHandler('CONSULTATION_BONUS'));
    this.engine.on('INTERACTION_ADJUST_POINT_BY_MANAGER', this.createDynamicEventHandler('INTERACTION_ADJUST_POINT_BY_MANAGER'));
    this.engine.on('REDEMPTION_DEDUCTION', this.createDynamicEventHandler('REDEMPTION_DEDUCTION')); // Add redemption handler
    
    // Consumer attribute event handlers (from consumer-attribute-rules.json)
    this.engine.on('FIRST_PURCHASE_BIRTH_MONTH_BONUS', this.createDynamicEventHandler('FIRST_PURCHASE_BIRTH_MONTH_BONUS'));
    this.engine.on('FLEXIBLE_VIP_MULTIPLIER', this.createDynamicEventHandler('FLEXIBLE_VIP_MULTIPLIER'));
    
    // Product multiplier event handlers (from product-multiplier-rules.json)
    this.engine.on('FLEXIBLE_PRODUCT_MULTIPLIER', this.createDynamicEventHandler('FLEXIBLE_PRODUCT_MULTIPLIER'));
    this.engine.on('FLEXIBLE_COMBO_PRODUCT_MULTIPLIER', this.createDynamicEventHandler('FLEXIBLE_COMBO_PRODUCT_MULTIPLIER'));
    
    // Basket threshold event handlers (from basket-threshold-rules.json)
    this.engine.on('FLEXIBLE_BASKET_AMOUNT', this.createDynamicEventHandler('FLEXIBLE_BASKET_AMOUNT'));

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
        const adjustmentValue = enrichedEventData.attributes?.adjustedPoints || enrichedEventData.attributes?.adjustmentAmount || 0;
        
        console.log(`Processing ${eventType} - market: ${market}, baseAmount: ${baseAmount}, discountedAmount: ${discountedAmount}`);
        
        let rewardPoints = 0;
        const params = event; // In json-rules-engine, the event object IS the params
        
        // Calculate rewards based on event type and parameters
        switch (eventType) {
          case 'INTERACTION_REGISTRY_POINT':
            rewardPoints = CalculationHelpers.calculateRegistrationReward(market, params);
            break;
            
          case 'ORDER_BASE_POINT':
            rewardPoints = CalculationHelpers.calculateBaseReward(market, baseAmount, discountedAmount, params);
            break;
            
          case 'ORDER_MULTIPLE_POINT_LIMIT':
            rewardPoints = CalculationHelpers.calculateMultiplierReward(market, baseAmount, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_CAMPAIGN_BONUS':
            rewardPoints = CalculationHelpers.calculateCampaignReward(market, baseAmount, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_VIP_MULTIPLIER':
            rewardPoints = CalculationHelpers.calculateTierMultiplier(market, baseAmount, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_BASKET_AMOUNT':
            rewardPoints = CalculationHelpers.calculateThresholdReward(market, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_PRODUCT_MULTIPLIER':
            rewardPoints = CalculationHelpers.calculateProductReward(market, baseAmount, discountedAmount, params);
            break;
            
          case 'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER':
            rewardPoints = CalculationHelpers.calculateComboReward(market, params);
            break;
            
          case 'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR':
            rewardPoints = CalculationHelpers.calculateActivityReward(market, itemCount, params);
            break;
            
          case 'CONSULTATION_BONUS':
            rewardPoints = CalculationHelpers.calculateConsultationReward(market, params);
            break;
            
          case 'FIRST_PURCHASE_BIRTH_MONTH_BONUS':
            rewardPoints = CalculationHelpers.calculateTimedBonus(market, baseAmount, discountedAmount, params);
            break;
            
          case 'INTERACTION_ADJUST_POINT_BY_MANAGER':
            rewardPoints = adjustmentValue;
            break;
            
          case 'REDEMPTION_DEDUCTION':
            const redemptionPoints = enrichedEventData.attributes?.redemptionPoints || params.redemptionPoints || 0;
            rewardPoints = CalculationHelpers.calculateRedemptionDeduction(market, redemptionPoints, params);
            // Add redemptionPoints to params for proper formula display
            params.redemptionPoints = redemptionPoints;
            break;
            
          default:
            console.warn(`Unknown event type: ${eventType}`);
            rewardPoints = 0;
        }
        
        console.log(`Calculated ${rewardPoints} reward points for ${eventType}`);
        
        // Add to breakdown with proper campaign information
        this.addToBreakdown(eventType, rewardPoints, FormattingHelpers.getDescription(eventType, market, rewardPoints), params);
        
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
        this.addError(`Failed to process ${eventType}: ${error.message}`);
      }
    };
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
      
      console.log('Processing event:', eventData.eventId, 'for consumer:', eventData.consumerId);
      
      // Validate event data according to generalized input template
      ValidationHelpers.validateEventData(eventData);
      
      // Special validation for RECYCLE events - check yearly bottle limits
      if (eventData.eventType === 'RECYCLE' && eventData.attributes?.recycledCount) {
        const user = consumerService.getConsumerById(eventData.consumerId);
        if (user && user.engagement?.recyclingActivity) {
          const recyclingActivity = user.engagement.recyclingActivity;
          const maxBottlesPerYear = 5; // As defined in transaction rules
          const currentYearRecycled = recyclingActivity.thisYearBottlesRecycled || 0;
          const requestedCount = eventData.attributes.recycledCount;
          const proposedTotal = currentYearRecycled + requestedCount;
          
          if (proposedTotal > maxBottlesPerYear) {
            const availableSlots = Math.max(0, maxBottlesPerYear - currentYearRecycled);
            const errorMessage = `Recycling limit exceeded. You have recycled ${currentYearRecycled} bottles this year and can only recycle ${availableSlots} more (max ${maxBottlesPerYear}/year). Requested: ${requestedCount}`;
            console.error(errorMessage);
            this.errors.push(errorMessage);
            
            // Return error response instead of processing
            return {
              consumerId: eventData.consumerId,
              eventId: eventData.eventId,
              eventType: eventData.eventType,
              totalPointsAwarded: 0,
              pointBreakdown: [],
              errors: this.errors,
              resultingBalance: consumerService.getBalance(eventData.consumerId) // Return current balance unchanged
            };
          }
        }
      }
      
      // Set consumer market if provided in event data
      if (eventData.market) {
        await consumerService.setConsumerMarket(eventData.consumerId, eventData.market);
      }
      
      // Fetch enriched consumer data from CDP with calculated attributes
      console.log('Fetching enriched consumer data from CDP...');
      const cdpData = await CDPService.getConsumerAttributesForRules(eventData.consumerId);
      console.log('CDP enriched attributes:', cdpData);
      
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
      
      console.log('Enriched event data with CDP:', {
        consumerId: enrichedEventData.consumerId,
        eventType: enrichedEventData.eventType,
        isVIP: enrichedEventData.isVIP,
        isBirthMonth: enrichedEventData.isBirthMonth,
        market: enrichedEventData.market,
        recycledCount: enrichedEventData.attributes.recycledCount
      });
      
      // Reset breakdown and errors for this processing
      this.rewardBreakdown = [];
      this.errors = [];
      
      // Store enriched event data for use in event handlers
      this.currentEnrichedEventData = enrichedEventData;
      
      // Add transaction amounts as facts for use in handlers
      this.engine.addFact('transactionAmount', enrichedEventData.transactionAmount || 0);
      this.engine.addFact('discountedAmount', enrichedEventData.discountedAmount || enrichedEventData.transactionAmount || 0);
      
      // Add productLine as a fact with default value to prevent "Undefined fact" errors
      this.engine.addFact('productLine', enrichedEventData.productLine || 'NONE');
      
      // DEBUG: Log facts for debugging
      console.log('=== DEBUG: Enriched Event Data ===');
      console.log('EventType:', enrichedEventData.eventType);
      console.log('Market:', enrichedEventData.market);
      console.log('IsVIP:', enrichedEventData.isVIP);
      console.log('IsBirthMonth:', enrichedEventData.isBirthMonth);
      console.log('Full Event:', JSON.stringify(enrichedEventData, null, 2));
      
      // Run the engine with the enriched event data - strictly following json-rules-engine patterns
      const engineResults = await this.engine.run(enrichedEventData);
      console.log('Engine run completed. Events triggered:', engineResults.events.length);
      console.log('Triggered events:', engineResults.events.map(e => ({type: e.type, params: e.params})));
      
      // Calculate total points from breakdown
      const totalRewardsAwarded = this.rewardBreakdown.reduce((sum, item) => sum + item.points, 0);
      
      // Get current consumer balance and update it
      const currentBalance = await consumerService.getBalance(eventData.consumerId);
      console.log('Current balance before update:', currentBalance);
      
      // Handle redemption vs earning differently
      let newTotal, newAvailable, newUsed;
      
      console.log(`=== BALANCE CALCULATION DEBUG ===`);
      console.log(`totalRewardsAwarded: ${totalRewardsAwarded}`);
      console.log(`Is redemption (< 0): ${totalRewardsAwarded < 0}`);
      
      if (totalRewardsAwarded < 0) {
        // Redemption: validate sufficient points before processing
        const redemptionAmount = Math.abs(totalRewardsAwarded);
        console.log(`REDEMPTION PATH - redemptionAmount: ${redemptionAmount}`);
        
        // Validate sufficient available points
        if (currentBalance.available < redemptionAmount) {
          const errorMessage = `Insufficient points for redemption. Available: ${currentBalance.available}, Requested: ${redemptionAmount}`;
          console.error(errorMessage);
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
        console.log(`Redemption logic: redemptionAmount=${redemptionAmount}, newTotal=${newTotal}, newAvailable=${newAvailable}, newUsed=${newUsed}`);
      } else {
        // Normal earning: add to total and available
        console.log(`EARNING PATH - adding ${totalRewardsAwarded} points`);
        newTotal = currentBalance.total + totalRewardsAwarded;
        newAvailable = currentBalance.available + totalRewardsAwarded;
        newUsed = currentBalance.used;
        console.log(`Earning logic: newTotal=${newTotal}, newAvailable=${newAvailable}, newUsed=${newUsed}`);
      }
      
      const newTransactionCount = (currentBalance.transactionCount || 0) + 1;
      
      console.log('New balance to update:', { total: newTotal, available: newAvailable, used: newUsed, transactionCount: newTransactionCount });
      
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
      
      console.log('✅ Event processed successfully:', response);
      return response;
      
    } catch (error) {
      console.error('Error processing event:', error);
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