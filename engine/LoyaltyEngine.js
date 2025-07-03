const { Engine } = require('json-rules-engine');
const consumerService = require('../services/consumerService');
const CampaignService = require('../services/CampaignService');
const FactsEngine = require('./FactsEngine');
const RuleDefinitions = require('./RuleDefinitions');
const { v4: uuidv4 } = require('uuid');

/**
 * Main Loyalty Engine - Orchestrates rule evaluation and point calculation
 * Follows json-rules-engine patterns with proper OOP design
 */
class LoyaltyEngine {
  constructor() {
    this.campaignService = new CampaignService();
    this.factsEngine = new FactsEngine();
    this.ruleDefinitions = new RuleDefinitions();
    this.pointCalculators = new Map();
    this.initializePointCalculators();
  }

  /**
   * Initialize point calculators for different rule types
   * STRICTLY FOLLOWING THE RULES TABLE SPECIFICATIONS
   */
  initializePointCalculators() {
    // ACCOUNT REGISTRATION
    // JP: 150 MD (only once per consumer if campaign is active)
    // HK/TW: 0 (No signup bonus)
    // Trigger: INTERACTION_ADD_POINT_BY_REGISTER / USER_ENROLLED
    this.pointCalculators.set('INTERACTION_REGISTRY_POINT', (event, eventData) => {
      const { market } = eventData;
      console.log('=== REGISTRATION CALCULATOR ===');
      console.log('Market:', market);
      
      if (market === 'JP') {
        console.log('JP Registration: 150 MD awarded');
        return 150; // JP: 150 MD only once per consumer if campaign is active
      }
      
      console.log('HK/TW Registration: 0 MD (no signup bonus)');
      return 0; // HK/TW: No signup bonus
    });

    // BASE PURCHASE
    // JP: 1 MD per JPY 10 spent - Formula: amount × 0.1 × 1
    // HK/TW: 1 MD per HKD/TWD spent based on SRP (retail price)
    // Trigger: ORDER_ADD_POINT / ORDER_COMPLETED
    this.pointCalculators.set('ORDER_BASE_POINT', (event, eventData) => {
      const { market, attributes = {} } = eventData;
      console.log('=== BASE PURCHASE CALCULATOR ===');
      console.log('Market:', market);
      console.log('Attributes:', attributes);
      
      if (market === 'JP') {
        // JP: 1 MD per JPY 10 spent - Formula: amount × 0.1 × 1
        const amount = attributes.amount || 0;
        const points = Math.floor(amount * 0.1);
        console.log('JP Base Purchase: amount =', amount, 'JPY, formula = amount × 0.1 =', points, 'MD');
        return points;
      }
      
      if (market === 'HK' || market === 'TW') {
        // HK/TW: 1 MD per HKD/TWD spent based on SRP (retail price)
        // Uses SRP, not paid price. Example: 3000 HKD basket = 3000 MD
        const srpAmount = attributes.srpAmount || attributes.amount || 0;
        const points = Math.floor(srpAmount);
        console.log('HK/TW Base Purchase: SRP amount =', srpAmount, ', points =', points, 'MD');
        return points;
      }
      
      console.log('No matching market for ORDER_BASE_POINT');
      return 0;
    });

    // 2X PURCHASE IN 60 DAYS
    // JP: 2× MD multiplier if 2nd purchase is within 60 days
    // HK/TW: Based on FLEXIBLE_CONSUMER_STATE_MULTIPLIER
    // Trigger: ORDER_MULTIPLE_POINT / FLEXIBLE_CONSUMER_STATE_MULTIPLIER
    this.pointCalculators.set('ORDER_MULTIPLE_POINT', (event, eventData) => {
      const { market, attributes = {} } = eventData;
      console.log('=== 2X PURCHASE CALCULATOR ===');
      console.log('Market:', market);
      
      if (market === 'JP') {
        // JP: 2× MD multiplier if 2nd purchase is within 60 days
        // This returns the ADDITIONAL points to make it 2× total
        const basePoints = Math.floor((attributes.amount || 0) * 0.1);
        console.log('JP 2X Purchase: base points =', basePoints, ', additional points =', basePoints);
        return basePoints; // Additional points to make total 2× base
      }
      
      // HK/TW: Based on FLEXIBLE_CONSUMER_STATE_MULTIPLIER
      const bonus = Math.floor(event.params?.multipleOrderBonus || 0);
      console.log('HK/TW Multiple Order: bonus =', bonus, 'MD');
      return bonus;
    });

    // CAMPAIGN-BASED MULTIPLIER
    // JP: E.g., 1.5× during campaigns (Valentine's, Golden Week, etc.)
    // HK/TW: Flexible Bonus MD or Multiplier (e.g., Lunar New Year bonus +300 MD)
    // Trigger: ORDER_MULTIPLE_POINT_LIMIT / FLEXIBLE_CAMPAIGN_BONUS
    this.pointCalculators.set('FLEXIBLE_CAMPAIGN_BONUS', (event, eventData) => {
      const { market, attributes = {} } = eventData;
      console.log('=== CAMPAIGN BONUS CALCULATOR ===');
      console.log('Market:', market);
      
      if (market === 'JP') {
        // JP: E.g., 1.5× during campaigns
        const multiplier = event.params?.multiplier || 1.5;
        const basePoints = Math.floor((attributes.amount || 0) * 0.1);
        const additionalPoints = Math.floor(basePoints * (multiplier - 1.0));
        console.log('JP Campaign: multiplier =', multiplier, ', base =', basePoints, ', additional =', additionalPoints);
        return additionalPoints; // Additional points from multiplier
      }
      
      // HK/TW: Flexible Bonus MD (e.g., +300 MD)
      const fixedBonus = Math.floor(event.params?.fixedBonus || 0);
      console.log('HK/TW Campaign: fixed bonus =', fixedBonus, 'MD');
      return fixedBonus;
    });

    // BOTTLE RECYCLING
    // JP: 50 MD per bottle, up to 5x/year (250 MD max)
    // HK/TW: (To be validated per local policy)
    // Trigger: INTERACTION_ADJUST_POINT_TIMES_PER_YEAR
    this.pointCalculators.set('INTERACTION_ADJUST_POINT_TIMES_PER_YEAR', (event, eventData) => {
      const { market } = eventData;
      const recycledCount = eventData.attributes?.recycledCount || 0;
      console.log('=== BOTTLE RECYCLING CALCULATOR ===');
      console.log('Market:', market, ', bottles:', recycledCount);
      
      if (market === 'JP') {
        // JP: 50 MD per bottle, up to 5x/year (250 MD max)
        const maxBottlesPerYear = 5;
        const pointsPerBottle = 50;
        const actualCount = Math.min(recycledCount, maxBottlesPerYear);
        const points = Math.floor(actualCount * pointsPerBottle);
        console.log('JP Recycling:', actualCount, 'bottles × 50 MD =', points, 'MD (max 5 bottles/year)');
        return points;
      }
      
      // HK/TW: To be validated per local policy
      const pointsPerBottle = event.params?.pointsPerBottle || 50;
      const points = Math.floor(recycledCount * pointsPerBottle);
      console.log('HK/TW Recycling:', recycledCount, 'bottles ×', pointsPerBottle, 'MD =', points, 'MD');
      return points;
    });

    // SKIN ASSESSMENT (MR TEST)
    // JP: 75 MD if completed within X days after first purchase
    // HK/TW: (To be validated)
    // Trigger: INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS
    this.pointCalculators.set('INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS', (event, eventData) => {
      const { market } = eventData;
      console.log('=== SKIN TEST CALCULATOR ===');
      console.log('Market:', market);
      
      if (market === 'JP') {
        console.log('JP Skin Test: 75 MD awarded');
        return 75; // JP: 75 MD if completed within X days after first purchase
      }
      
      // HK/TW: To be validated
      const skinTestBonus = Math.floor(event.params?.skinTestBonus || 75);
      console.log('HK/TW Skin Test:', skinTestBonus, 'MD');
      return skinTestBonus;
    });

    // VIP STATUS MULTIPLIER
    // JP: (Not used) - No current implementation in JP
    // HK/TW: Bonus points if member and counter are in uploaded VIP list
    // Trigger: FLEXIBLE_VIP_MULTIPLIER
    this.pointCalculators.set('FLEXIBLE_VIP_MULTIPLIER', (event, eventData) => {
      const { market, attributes = {} } = eventData;
      console.log('=== VIP MULTIPLIER CALCULATOR ===');
      console.log('Market:', market);
      
      if (market === 'JP') {
        console.log('JP VIP: Not used (0 MD)');
        return 0; // JP: Not used
      }
      
      if (market === 'HK' || market === 'TW') {
        // HK/TW: Bonus points if member and counter are in uploaded VIP list
        const multiplier = event.params?.multiplier || 2.0;
        const baseAmount = attributes.srpAmount || attributes.amount || 0;
        const basePoints = Math.floor(baseAmount);
        const additionalPoints = Math.floor(basePoints * (multiplier - 1.0));
        console.log('HK/TW VIP: base =', basePoints, ', multiplier =', multiplier, ', additional =', additionalPoints);
        return additionalPoints; // Additional points beyond base
      }
      
      return 0;
    });

    // BIRTH MONTH BONUS (1ST PURCHASE)
    // JP: (Not active) - Not mentioned in JP specs
    // HK/TW: Bonus multiplier or MD if first purchase is within consumer's birth month
    // Trigger: FIRST_PURCHASE_BIRTH_MONTH_BONUS
    this.pointCalculators.set('FIRST_PURCHASE_BIRTH_MONTH_BONUS', (event, eventData) => {
      const { market, attributes = {} } = eventData;
      console.log('=== BIRTH MONTH BONUS CALCULATOR ===');
      console.log('Market:', market);
      
      if (market === 'JP') {
        console.log('JP Birth Month: Not active (0 MD)');
        return 0; // JP: Not active
      }
      
      if (market === 'HK' || market === 'TW') {
        // HK/TW: Bonus multiplier or MD if first purchase is within consumer's birth month
        const baseAmount = attributes.srpAmount || attributes.amount || 0;
        const bonusPercentage = event.params?.bonusPercentage || 0.1; // 10% bonus
        const bonusPoints = Math.floor(baseAmount * bonusPercentage);
        console.log('HK/TW Birth Month: base =', baseAmount, ', bonus % =', bonusPercentage, ', points =', bonusPoints);
        return bonusPoints;
      }
      
      return 0;
    });

    // BASKET THRESHOLD BONUS
    // JP: (Not active) - May be future scope
    // HK/TW: Bonus if basket value (SRP) exceeds threshold (e.g., 5,000 HKD/TWD)
    // Trigger: FLEXIBLE_BASKET_AMOUNT
    this.pointCalculators.set('FLEXIBLE_BASKET_AMOUNT', (event, eventData) => {
      const { market, attributes = {} } = eventData;
      console.log('=== BASKET THRESHOLD CALCULATOR ===');
      console.log('Market:', market);
      
      if (market === 'JP') {
        console.log('JP Basket Threshold: Not active (0 MD)');
        return 0; // JP: Not active
      }
      
      if (market === 'HK' || market === 'TW') {
        // HK/TW: Bonus if basket value (SRP) exceeds threshold
        const srpAmount = attributes.srpAmount || 0;
        const threshold = event.params?.threshold || 5000;
        const bonus = event.params?.bonus || 200;
        
        if (srpAmount >= threshold) {
          console.log('HK/TW Basket Threshold: SRP =', srpAmount, ', threshold =', threshold, ', bonus =', bonus);
          return Math.floor(bonus);
        } else {
          console.log('HK/TW Basket Threshold: SRP =', srpAmount, '< threshold', threshold, '(no bonus)');
        }
      }
      
      return 0;
    });

    // PRODUCT-BASED MULTIPLIER
    // JP: (Not used currently) - May apply to future campaigns
    // HK/TW: Specific SK-II products (e.g., FTE) have multipliers like 1.5×
    // Trigger: FLEXIBLE_PRODUCT_MULTIPLIER
    this.pointCalculators.set('FLEXIBLE_PRODUCT_MULTIPLIER', (event, eventData) => {
      const { market, attributes = {} } = eventData;
      console.log('=== PRODUCT MULTIPLIER CALCULATOR ===');
      console.log('Market:', market);
      
      if (market === 'JP') {
        console.log('JP Product Multiplier: Not used currently (0 MD)');
        return 0; // JP: Not used currently
      }
      
      if (market === 'HK' || market === 'TW') {
        // HK/TW: Specific SK-II products have multipliers like 1.5×
        const multiplier = event.params?.multiplier || 1.5;
        const baseAmount = attributes.srpAmount || attributes.amount || 0;
        const basePoints = Math.floor(baseAmount);
        const additionalPoints = Math.floor(basePoints * (multiplier - 1.0));
        console.log('HK/TW Product Multiplier: base =', basePoints, ', multiplier =', multiplier, ', additional =', additionalPoints);
        return additionalPoints; // Additional points from multiplier
      }
      
      return 0;
    });

    // PRODUCT COMBO BONUS
    // JP: (Not active) - To be supported later
    // HK/TW: Bonus if specific product combinations are bought together
    // Trigger: FLEXIBLE_COMBO_PRODUCT_MULTIPLIER
    this.pointCalculators.set('FLEXIBLE_COMBO_PRODUCT_MULTIPLIER', (event, eventData) => {
      const { market } = eventData;
      console.log('=== COMBO PRODUCT CALCULATOR ===');
      console.log('Market:', market);
      
      if (market === 'JP') {
        console.log('JP Combo Product: Not active (0 MD)');
        return 0; // JP: Not active
      }
      
      if (market === 'HK' || market === 'TW') {
        // HK/TW: Bonus if specific product combinations are bought together
        const bonus = Math.floor(event.params?.bonus || 250);
        console.log('HK/TW Combo Product: bonus =', bonus, 'MD');
        return bonus;
      }
      
      return 0;
    });

    // MANUAL ADJUSTMENT
    // All Markets: Varies (Admin-defined)
    // Trigger: INTERACTION_ADJUST_POINT_BY_MANAGER
    this.pointCalculators.set('INTERACTION_ADJUST_POINT_BY_MANAGER', (event, eventData) => {
      console.log('=== MANUAL ADJUSTMENT CALCULATOR ===');
      // All Markets: Varies (Admin-defined)
      const adjustedPoints = Math.floor(eventData.attributes?.adjustedPoints || 0);
      console.log('Manual Adjustment:', adjustedPoints, 'MD');
      return adjustedPoints;
    });

    // GIFT REDEMPTION
    // All Markets: MD deduction based on gift value
    // Trigger: GIFT_REDEEM / LOYALTY_BURN
    this.pointCalculators.set('GIFT_REDEEM', (event, eventData) => {
      console.log('=== GIFT REDEMPTION CALCULATOR ===');
      // All Markets: MD deduction based on gift value
      const giftValue = eventData.attributes?.giftValue || 0;
      const deduction = -Math.floor(giftValue); // Negative because it's a deduction
      console.log('Gift Redemption: deduction =', deduction, 'MD');
      return deduction;
    });

    this.pointCalculators.set('LOYALTY_BURN', (event, eventData) => {
      console.log('=== LOYALTY BURN CALCULATOR ===');
      // All Markets: MD deduction based on burn amount
      const burnAmount = eventData.attributes?.burnAmount || 0;
      const deduction = -Math.floor(burnAmount); // Negative because it's a deduction
      console.log('Loyalty Burn: deduction =', deduction, 'MD');
      return deduction;
    });

    console.log('✅ All point calculators initialized according to rules table');
  }

  /**
   * Process an event through the rules engine
   */
  async processEvent(eventData) {
    try {
      console.log('Processing event:', eventData.eventId, 'for consumer:', eventData.consumerId);
      
      // Create engine instance
      const engine = new Engine();
      
      // Add all facts to engine
      await this.factsEngine.addFactsToEngine(engine, eventData);
      
      // Get applicable rules
      const rules = await this.getApplicableRules(eventData);
      console.log('Applicable rules found:', rules.length);
      
      // Add rules to engine
      rules.forEach(rule => {
        engine.addRule(rule);
      });
      
      // Track triggered events
      const triggeredEvents = [];
      
      // Subscribe to rule success events
      engine.on('success', (event, almanac, ruleResult) => {
        console.log('Rule triggered:', event.type, 'with params:', event.params);
        triggeredEvents.push({ event, ruleResult, almanac });
      });
      
      // Subscribe to rule failure events for debugging
      engine.on('failure', (event, almanac, ruleResult) => {
        console.log('Rule failed:', event.type, 'reason:', ruleResult.conditions);
      });
      
      // Run the engine
      const engineResults = await engine.run(eventData);
      console.log('Engine run completed. Triggered events:', triggeredEvents.length);
      
      // Build response
      const response = await this.buildResponse(eventData, triggeredEvents);
      console.log('Response built:', response);
      
      return response;
      
    } catch (error) {
      console.error('Error processing event:', error);
      throw new Error(`Event processing failed: ${error.message}`);
    }
  }

  /**
   * Get applicable rules for an event
   */
  async getApplicableRules(eventData) {
    const rules = [];
    
    try {
      // Get base rules for event type
      const baseRules = this.ruleDefinitions.getBaseRules(eventData.eventType);
      rules.push(...baseRules);
      
      // Get rules by category
      const basketRules = this.ruleDefinitions.getBasketRules();
      const consumerRules = this.ruleDefinitions.getConsumerAttributeRules();
      const productRules = this.ruleDefinitions.getProductRules();
      const transactionRules = this.ruleDefinitions.getTransactionRules();
      
      rules.push(...basketRules, ...consumerRules, ...productRules, ...transactionRules);
      
      // Get campaign-specific rules
      const applicableCampaigns = await this.campaignService.getApplicableCampaigns(eventData);
      for (const campaign of applicableCampaigns) {
        const campaignRules = this.ruleDefinitions.getCampaignRules(campaign);
        rules.push(...campaignRules);
      }
      
      // Get context-specific rules
      const contextRules = this.ruleDefinitions.getContextRules(
        eventData.market, 
        eventData.channel, 
        eventData.eventType
      );
      rules.push(...contextRules);
      
      console.log('Total applicable rules:', rules.length);
      return rules;
      
    } catch (error) {
      console.error('Error getting applicable rules:', error);
      return rules;
    }
  }

  /**
   * Build the response following the exact output template
   */
  async buildResponse(eventData, triggeredEvents) {
    const pointBreakdown = [];
    let totalPointsAwarded = 0;
    const errors = [];
    
    try {
      // Get applicable campaigns for campaign info
      const applicableCampaigns = await this.campaignService.getApplicableCampaigns(eventData);
      
      // Process triggered events
      for (const { event, ruleResult, almanac } of triggeredEvents) {
        try {
          const points = this.calculatePoints(event, eventData);
          console.log('Calculated points for rule', event.type, ':', points);
          
          if (points !== 0) { // Allow negative points for redemptions
            const breakdown = {
              ruleId: event.type,
              points: points,
              description: this.getPointDescription(event, eventData, points)
            };
            
            // Add campaign info if applicable
            const campaign = applicableCampaigns.find(c => 
              c.ruleIds && c.ruleIds.includes(event.type)
            );
            
            if (campaign) {
              breakdown.campaignId = campaign.campaignId;
              breakdown.campaignCode = campaign.campaignCode;
              breakdown.campaignStart = campaign.startDate;
              breakdown.campaignEnd = campaign.endDate;
            }
            
            pointBreakdown.push(breakdown);
            totalPointsAwarded += points;
          }
        } catch (error) {
          console.error('Error calculating points for rule', event.type, ':', error);
          errors.push(`Rule ${event.type} evaluation failed: ${error.message}`);
        }
      }
      
      // Update consumer balance
      console.log('=== BALANCE UPDATE ===');
      console.log('Consumer ID:', eventData.consumerId);
      console.log('Total points to award:', totalPointsAwarded);
      const resultingBalance = consumerService.updateBalance(eventData.consumerId, totalPointsAwarded);
      console.log('Resulting balance:', resultingBalance);
      console.log('======================');
      
      // Build response
      const response = {
        consumerId: eventData.consumerId,
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        totalPointsAwarded,
        pointBreakdown,
        errors,
        resultingBalance
      };
      
      // Log the event
      consumerService.logEvent({
        ...response,
        timestamp: new Date().toISOString(),
        originalEvent: eventData
      });
      
      return response;
      
    } catch (error) {
      console.error('Error building response:', error);
      throw error;
    }
  }

  /**
   * Calculate points using registered calculators
   */
  calculatePoints(event, eventData) {
    console.log('=== CALCULATE POINTS ===');
    console.log('Rule type:', event.type);
    console.log('Event params:', event.params);
    console.log('Event data market:', eventData.market);
    console.log('Event data attributes:', eventData.attributes);
    
    const calculator = this.pointCalculators.get(event.type);
    if (calculator) {
      try {
        const points = calculator(event, eventData);
        console.log('FINAL POINTS for', event.type, ':', points);
        console.log('========================');
        return points;
      } catch (error) {
        console.error('Error in calculator for', event.type, ':', error);
        return 0;
      }
    }
    console.warn('No calculator found for rule type:', event.type);
    return 0;
  }

  /**
   * Generate point description for transparency
   */
  getPointDescription(event, eventData, points) {
    const { market, attributes = {} } = eventData;
    
    const descriptions = {
      'INTERACTION_REGISTRY_POINT': market === 'JP' ? 'Registration bonus (JP)' : 'Registration (no bonus)',
      'ORDER_BASE_POINT': market === 'JP' ? 
        `Base purchase points (1 MD per JPY 10)` : 
        `Base purchase points (1 MD per ${attributes.currency || 'unit'} SRP)`,
      'ORDER_MULTIPLE_POINT': market === 'JP' ? 
        'Second purchase within 60 days (2× multiplier)' : 
        'Multiple order bonus',
      'FLEXIBLE_CAMPAIGN_BONUS': market === 'JP' ? 
        'Campaign multiplier bonus' : 
        'Campaign fixed bonus',
      'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR': 'Bottle recycling bonus',
      'INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS': 'Skin test within time limit',
      'FIRST_PURCHASE_BIRTH_MONTH_BONUS': 'Birth month purchase bonus',
      'FLEXIBLE_BASKET_AMOUNT': 'Basket threshold bonus',
      'FLEXIBLE_PRODUCT_MULTIPLIER': 'Product multiplier bonus',
      'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER': 'Combo product bonus',
      'FLEXIBLE_VIP_MULTIPLIER': 'VIP multiplier bonus',
      'INTERACTION_ADJUST_POINT_BY_MANAGER': 'Admin adjustment',
      'GIFT_REDEEM': 'Gift redemption',
      'LOYALTY_BURN': 'Points redemption'
    };
    
    return event.params?.description || descriptions[event.type] || `Points from ${event.type}`;
  }

  /**
   * Add a new point calculator
   */
  addPointCalculator(ruleType, calculator) {
    this.pointCalculators.set(ruleType, calculator);
    console.log('Added point calculator for:', ruleType);
  }

  /**
   * Remove a point calculator
   */
  removePointCalculator(ruleType) {
    this.pointCalculators.delete(ruleType);
    console.log('Removed point calculator for:', ruleType);
  }

  /**
   * Get all registered calculators
   */
  getCalculators() {
    return Array.from(this.pointCalculators.keys());
  }

  /**
   * Validate event data
   */
  validateEventData(eventData) {
    const required = ['eventId', 'eventType', 'timestamp', 'market', 'channel', 'productLine', 'consumerId'];
    const missing = required.filter(field => !eventData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    if (!['JP', 'HK', 'TW'].includes(eventData.market)) {
      throw new Error(`Invalid market: ${eventData.market}. Must be JP, HK, or TW`);
    }
    
    if (!['PURCHASE', 'INTERACTION', 'ADJUSTMENT', 'REDEMPTION'].includes(eventData.eventType)) {
      throw new Error(`Invalid event type: ${eventData.eventType}`);
    }
    
    return true;
  }
}

module.exports = LoyaltyEngine;