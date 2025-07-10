const { Engine } = require('json-rules-engine');
const consumerService = require('../services/consumerService');
const FactsEngine = require('./FactsEngine');
const CalculationHelpers = require('./helpers/CalculationHelpers');
const ValidationHelpers = require('./helpers/ValidationHelpers');
const FormattingHelpers = require('./helpers/FormattingHelpers');
const { logger } = require('../src/utils');
const fs = require('fs');
const path = require('path');

/**
 * RULES ENGINE - The Heart of Point Calculation and Business Logic
 * 
 * WHAT IT DOES:
 * - Evaluates business rules against incoming events to determine point awards
 * - Coordinates between facts, rules, and calculation logic
 * - Manages event processing lifecycle from validation to point award
 * - Handles dynamic rule loading and event-driven architecture
 * 
 * HOW IT WORKS:
 * 1. INITIALIZATION: Load rules from JSON files, setup facts, register event handlers
 * 2. EVENT PROCESSING: Validate incoming events, enrich with additional data
 * 3. RULE EVALUATION: Run json-rules-engine to find matching rules
 * 4. POINT CALCULATION: Execute rule actions to calculate point awards
 * 5. BALANCE UPDATE: Update consumer point balance and transaction history
 * 6. RESPONSE: Return structured result with points, breakdowns, and errors
 * 
 * ARCHITECTURE PATTERN:
 * - Uses json-rules-engine for rule evaluation (condition → action pattern)
 * - Event-driven: Rules emit events, handlers calculate points
 * - Dynamic: Rules and handlers are discovered and registered automatically
 * - Extensible: New rule types can be added by creating JSON rules and handlers
 */
class RulesEngine {
  constructor() {
    // Core engine components
    this.factsEngine = new FactsEngine();  // Manages fact definitions and computations
    this.engine = new Engine();           // json-rules-engine instance for rule evaluation
    
    // Processing state (reset for each event)
    this.rewardBreakdown = [];            // Array of point awards with descriptions
    this.errors = [];                     // Array of processing errors/warnings
    this.currentEnrichedEventData = null; // Current event data being processed
    
    // Engine lifecycle
    this.initialized = false;             // Prevents double initialization
  }

  /**
   * INITIALIZE THE RULES ENGINE
   * Called once at startup to prepare the engine for event processing
   * 
   * INITIALIZATION STEPS:
   * 1. Register all facts from FactsEngine with json-rules-engine
   * 2. Load all JSON rule files from the rules directory
   * 3. Discover event types from loaded rules
   * 4. Register dynamic event handlers for each event type
   * 5. Mark engine as initialized
   */
  async initializeEngine() {
    if (this.initialized) return; // Prevent double initialization
    
    // Step 1: Register facts (makes facts available to rule conditions)
    await this.factsEngine.addFactsToEngine(this.engine);
    
    // Step 2: Load rules from JSON files
    await this.loadRulesFromFiles();
    
    // Step 3 & 4: Setup dynamic event handlers
    this.initializeEventHandlers();
    
    this.initialized = true;
    logger.info('Rules Engine initialized with json-rules-engine patterns');
  }

  /**
   * LOAD RULES FROM JSON FILES
   * Scans the rules directory and loads all JSON rule definitions
   * 
   * RULE FILE FORMAT:
   * Each JSON file contains an array of rule objects with:
   * - name: Human-readable rule name
   * - conditions: json-rules-engine condition object (what must be true)
   * - event: What to do when conditions are met (type + params)
   * - priority: Execution order (lower numbers run first)
   */
  async loadRulesFromFiles() {
    const rulesDir = path.join(__dirname, '../rules');
    
    if (!fs.existsSync(rulesDir)) {
      throw new Error('Rules directory not found.');
    }

    const ruleFiles = fs.readdirSync(rulesDir).filter(file => file.endsWith('.json'));
    
    if (ruleFiles.length === 0) {
      throw new Error('No rule files found in rules directory.');
    }
    
    // Load each rule file and add rules to the engine
    for (const file of ruleFiles) {
      const filePath = path.join(rulesDir, file);
      try {
        const rulesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Add each rule to the json-rules-engine
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
   * INITIALIZE EVENT HANDLERS - Setup Dynamic Event Processing
   * 
   * WHAT HAPPENS:
   * 1. Scan all loaded rules to discover unique event types
   * 2. Create a dynamic event handler for each event type
   * 3. Register handlers with json-rules-engine
   * 4. Setup success handler for rule evaluation completion
   * 
   * WHY DYNAMIC:
   * - New rule types can be added just by creating JSON rules
   * - No need to modify code for new event types
   * - Handlers are auto-discovered from rule definitions
   * 
   * EVENT HANDLER FLOW:
   * Rule matches → Engine emits event → Handler calculates points → Handler updates breakdown
   */
  initializeEventHandlers() {
    // Step 1: Discover all event types from loaded rules
    const eventTypes = this.getEventTypesFromRules();
    
    logger.debug('Discovered event types from rules', { 
      eventTypes: Array.from(eventTypes),
      totalRules: this.engine.rules.length 
    });
    
    // Step 2: Create and register a handler for each event type
    eventTypes.forEach(eventType => {
      this.engine.on(eventType, this.createDynamicEventHandler(eventType));
      logger.debug(`Registered dynamic handler for event type: ${eventType}`);
    });

    // Step 3: Register success handler for rule evaluation completion
    this.engine.on('success', (event, almanac, ruleResult) => {
      logger.debug('Engine run completed', { 
        eventsTriggered: ruleResult.events?.length || 0,
        eventTypes: ruleResult.events?.map(e => e.type) || []
      });
    });

    logger.info(`Dynamically initialized ${eventTypes.size} event handlers`);
  }

  /**
   * DISCOVER EVENT TYPES FROM LOADED RULES
   * Scans all rules to find unique event types that need handlers
   * 
   * RETURNS: Set of unique event type strings found in rule definitions
   */
  getEventTypesFromRules() {
    const eventTypes = new Set();
    
    this.engine.rules.forEach((rule) => {
      let eventType = null;
      
      if (rule.ruleEvent && rule.ruleEvent.type) {
        eventType = rule.ruleEvent.type;
      }
      
      if (!eventType && typeof rule.toJSON === 'function') {
        const ruleData = rule.toJSON();
        if (ruleData.event && ruleData.event.type) {
          eventType = ruleData.event.type;
        }
      }
      
      if (eventType) {
        eventTypes.add(eventType);
      }
    });
    
    return eventTypes;
  }

  /**
   * CREATE DYNAMIC EVENT HANDLER - Factory for Rule Event Handlers
   * 
   * WHAT IT CREATES:
   * A specialized handler function for each event type that:
   * 1. Extracts relevant facts from the almanac (rule evaluation context)
   * 2. Calculates point rewards using the appropriate calculation method
   * 3. Formats reward description and adds to breakdown
   * 4. Handles errors gracefully with logging
   * 
   * WHY DYNAMIC:
   * - One handler can process different event types with same logic
   * - New event types don't require code changes
   * - Calculation method is determined by rule parameters
   * 
   * CALCULATION FLOW:
   * Rule triggers → Handler called → Extract facts → Calculate points → Update breakdown
   */
  createDynamicEventHandler(eventType) {
    return async (event, almanac) => {
      try {
        // EXTRACT FACTS: Get computed values needed for calculations
        const market = await almanac.factValue('market');
        const baseAmount = await almanac.factValue('transactionAmount');
        const discountedAmount = await almanac.factValue('discountedAmount');
        
        // GET ENRICHED EVENT DATA: Access to full event context
        const enrichedEventData = this.currentEnrichedEventData;
        const itemCount = enrichedEventData?.attributes?.recycledCount || 
                         enrichedEventData?.attributes?.itemCount || 0;
        const adjustmentValue = enrichedEventData?.attributes?.adjustedPoints || 
                               enrichedEventData?.attributes?.adjustmentPoints || 0;

        const params = event; // Rule parameters from JSON rule definition

        // CALCULATE POINTS: Use method specified in rule or fallback to simple
        let rewardPoints = 0;
        if (params.calculationMethod) {
          // Advanced calculation with method-specific logic
          rewardPoints = await this.calculateRewardDynamically(params.calculationMethod, {
            market, baseAmount, discountedAmount, itemCount, adjustmentValue, params, enrichedEventData
          });
        } else {
          // Simple calculation fallback
          rewardPoints = this.calculateSimpleReward(params, {
            baseAmount, discountedAmount, adjustmentValue, itemCount, enrichedEventData
          });
        }

        logger.debug('Calculated reward points', { eventType, rewardPoints });

        this.rewardBreakdown.push({
          ruleId: eventType,
          points: rewardPoints,
          description: FormattingHelpers.getDescription(eventType, market, rewardPoints),
          ruleCategory: FormattingHelpers.getRuleCategory(eventType),
          computation: FormattingHelpers.generateComputationDetails(eventType, rewardPoints, params)
        });

      } catch (error) {
        logger.error(`Error in ${eventType} handler`, { error: error.message, stack: error.stack });
        this.errors.push(`${eventType} calculation failed: ${error.message}`);
      }
    };
  }

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
        params.redemptionPoints = redemptionPoints;
        return CalculationHelpers.calculateRedemptionDeduction(market, redemptionPoints, params);
      case 'fixed':
        return params.fixedPoints || params.bonus || params.fixedBonus || 0;
      case 'percentage':
        const amount = params.useDiscounted ? discountedAmount : baseAmount;
        return Math.round((amount * (params.percentage || 0)) / 100);
      case 'formula':
        return this.evaluateFormula(params.formula, context);
      default:
        logger.warn('Unknown calculation method', { calculationMethod });
        return 0;
    }
  }

  calculateSimpleReward(params, context) {
    const { baseAmount, discountedAmount, adjustmentValue, itemCount, enrichedEventData } = context;

    // Recycling events
    if (params.pointsPerBottle && itemCount > 0) {
      const pointsPerBottle = params.pointsPerBottle || 50;
      const maxPerYear = params.maxPerYear || 5;
      const totalBottles = itemCount;
      const earnedPoints = Math.min(totalBottles, maxPerYear) * pointsPerBottle;
      
      logger.debug('Recycling reward calculation', { 
        totalBottles, pointsPerBottle, maxPerYear, earnedPoints 
      });
      
      return earnedPoints;
    }
    
    // Consultation events
    if (params.consultationBonus) {
      return params.consultationBonus;
    }
    
    // Redemption events
    if (params.description && params.description.includes('redeemed')) {
      const redemptionPoints = enrichedEventData?.attributes?.redemptionPoints || 
                              params.redemptionPoints || 
                              enrichedEventData?.attributes?.amount || 0;
      
      logger.debug('Redemption deduction calculation', { redemptionPoints });
      return -Math.abs(redemptionPoints);
    }
    
    // Manual adjustment events
    if (params.description && params.description.includes('adjustment')) {
      const adjustmentPoints = enrichedEventData?.attributes?.adjustedPoints || 
                              enrichedEventData?.attributes?.adjustmentPoints ||
                              adjustmentValue || 0;
      
      logger.debug('Manual adjustment calculation', { adjustmentPoints });
      return adjustmentPoints;
    }
    
    // Standard reward calculations
    if (params.fixedPoints) return params.fixedPoints;
    if (params.bonus) return params.bonus;
    if (params.multiplier && baseAmount) return Math.round(baseAmount * params.multiplier);
    if (params.percentage && baseAmount) return Math.round((baseAmount * params.percentage) / 100);
    if (params.adjustmentPoints || adjustmentValue) return adjustmentValue;
    
    return 0;
  }

  evaluateFormula(formula, context) {
    try {
      const func = new Function('context', `return ${formula}`);
      return func(context);
    } catch (error) {
      logger.error('Formula evaluation failed', { formula, error: error.message });
      return 0;
    }
  }

  /**
   * PROCESS EVENT - Main Entry Point for Event Processing
   * This is the primary method called by external systems to process loyalty events
   * 
   * PROCESSING FLOW:
   * 1. RESET STATE: Clear previous rewards and errors
   * 2. VALIDATE: Check event data format and business rules
   * 3. ENRICH: Add calculated fields and normalize data
   * 4. EVALUATE: Run rules engine to find matching rules
   * 5. CALCULATE: Execute rule actions to determine point awards
   * 6. UPDATE: Modify consumer balance and transaction history
   * 7. RESPOND: Return structured result with all details
   * 
   * INPUT: eventData object with structure:
   * {
   *   eventId, consumerId, eventType, market, channel,
   *   timestamp, context: {storeId, campaignCode},
   *   attributes: {amount, skuList, etc.}
   * }
   * 
   * OUTPUT: Processing result with:
   * {
   *   consumerId, eventId, eventType, totalPointsAwarded,
   *   pointBreakdown: [{ruleId, points, description}],
   *   errors: [warnings], resultingBalance: {total, available, used}
   * }
   */
  async processEvent(eventData) {
    try {
      // STEP 1: RESET STATE - Clear previous processing state
      this.rewardBreakdown = [];  // Reset point awards from previous events
      this.errors = [];           // Reset error collection

      // STEP 2: ENSURE ENGINE IS INITIALIZED
      await this.initializeEngine();

      // STEP 3: VALIDATE EVENT DATA
      // Check required fields, data types, business constraints
      ValidationHelpers.validateCompleteEvent(eventData);

      // STEP 4: ENRICH EVENT DATA
      // Add calculated fields, normalize values, prepare for rule evaluation
      const enrichedEventData = this.enrichEventData(eventData);
      this.currentEnrichedEventData = enrichedEventData; // Store for event handlers

      // STEP 5: UPDATE CONSUMER MARKET (for market-specific rule processing)
      consumerService.setConsumerMarket(eventData.consumerId, eventData.market);

      // STEP 6: RUN RULES ENGINE
      // Evaluate all rules against enriched event data
      // Matching rules will emit events that trigger point calculations
      const results = await this.engine.run(enrichedEventData);

      // STEP 7: CALCULATE TOTAL POINTS
      // Sum all point awards from triggered rules
      const totalPointsAwarded = this.rewardBreakdown.reduce((sum, reward) => sum + reward.points, 0);

      // STEP 8: UPDATE CONSUMER BALANCE
      // Handle both positive point awards and negative redemptions
      let resultingBalance;
      const currentBalance = consumerService.getBalance(eventData.consumerId);
      
      if (eventData.eventType === 'REDEMPTION' && totalPointsAwarded < 0) {
        // REDEMPTION: Deduct points and track usage
        const newTotal = currentBalance.total + totalPointsAwarded; // totalPointsAwarded is negative
        const newUsed = currentBalance.used + Math.abs(totalPointsAwarded);
        resultingBalance = consumerService.updateBalance(eventData.consumerId, {
          total: newTotal,
          available: newTotal,
          used: newUsed,
          transactionCount: currentBalance.transactionCount + 1
        });
      } else {
        // POINT AWARD: Add points to total
        const newTotal = currentBalance.total + totalPointsAwarded;
        resultingBalance = consumerService.updateBalance(eventData.consumerId, {
          total: newTotal,
          available: newTotal,
          used: currentBalance.used,
          transactionCount: currentBalance.transactionCount + 1
        });
      }

      // STEP 9: CREATE EVENT RESULT FOR LOGGING
      // Include all necessary fields for transaction history
      const eventResult = {
        consumerId: eventData.consumerId,
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        timestamp: eventData.timestamp, // CRITICAL: Include timestamp for transaction history
        market: eventData.market,       // Include market for history filtering
        channel: eventData.channel,     // Include channel for transaction context
        totalPointsAwarded,
        pointBreakdown: this.rewardBreakdown,
        errors: this.errors,
        resultingBalance
      };

      // STEP 10: LOG TRANSACTION TO HISTORY
      consumerService.logEvent(eventResult);

      logger.info('Event processed successfully', {
        consumerId: eventData.consumerId,
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        totalPointsAwarded,
        errors: this.errors,
        resultingBalance
      });

      return eventResult;

    } catch (error) {
      logger.error('Event processing failed', { 
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        error: error.message,
        stack: error.stack
      });

      throw new Error(`Event processing failed: ${error.message}`);
    }
  }

  /**
   * ENRICH EVENT DATA - Prepare Event Data for Rule Evaluation
   * 
   * WHAT IT DOES:
   * - Ensures required fields exist with default values
   * - Normalizes data structure for consistent rule evaluation
   * - Adds computed fields if needed
   * 
   * ENRICHMENT STEPS:
   * 1. Clone original event data to avoid mutation
   * 2. Add default timestamp if missing
   * 3. Ensure attributes and context objects exist
   * 4. Return enriched data ready for json-rules-engine
   * 
   * USED BY: processEvent method before running rules engine
   */
  enrichEventData(eventData) {
    // Clone to avoid mutating original data
    const enriched = { ...eventData };
    
    // Ensure timestamp exists (required for date/time facts)
    if (!enriched.timestamp) {
      enriched.timestamp = new Date().toISOString();
    }
    
    // Ensure required object properties exist (prevents null reference errors)
    enriched.attributes = enriched.attributes || {};
    enriched.context = enriched.context || {};
    
    return enriched;
  }

  /**
   * RUNTIME RULE MANAGEMENT - Add rules dynamically
   * Allows adding new rules without restarting the engine
   */
  addRule(ruleDefinition) {
    this.engine.addRule(ruleDefinition);
  }

  removeRule(ruleDefinition) {
    this.engine.removeRule(ruleDefinition);
  }

  getRules() {
    return this.engine.rules;
  }
}

module.exports = RulesEngine;
