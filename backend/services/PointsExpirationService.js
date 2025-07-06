/**
 * Points Expiration Service
 * Handles market-specific point expiration rules and calculations
 */

class PointsExpirationService {
  constructor() {
    // Market-specific expiration configurations
    this.expirationConfigs = {
      'JP': {
        standardExpiry: 'yearly', // cumulative days from last transaction
        expiryDays: 365,
        extensionTrigger: 'ORDER',
        interactionPointsExpiry: 'individual', // expire individually 1 year after each action
        specialNotes: 'Uses LGR.1–LGR.4. Manual/admin actions don\'t extend expiry.',
        timezone: 'Asia/Tokyo'
      },
      'HK': {
        standardExpiry: 'fiscal_year', // fiscal year-based (July 1 to June 30)
        extensionTrigger: 'configurable',
        interactionPointsExpiry: 'bulk', // all points expire together on defined date
        specialNotes: 'Trigger: POINTS_EXPIRE_SCHEDULE. Runs daily, expires at 11:59 PM HK time.',
        timezone: 'Asia/Hong_Kong',
        fiscalYearStart: { month: 7, day: 1 }, // July 1
        fiscalYearEnd: { month: 6, day: 30 } // June 30
      },
      'TW': {
        standardExpiry: 'fiscal_year', // similar to HK
        extensionTrigger: 'configurable',
        interactionPointsExpiry: 'bulk',
        specialNotes: 'Similar to HK with Taiwan-specific configurations.',
        timezone: 'Asia/Taipei',
        fiscalYearStart: { month: 7, day: 1 },
        fiscalYearEnd: { month: 6, day: 30 }
      }
    };
  }

  /**
   * Calculate next expiration date for a consumer based on market and activity
   * @param {string} consumerId - Consumer ID
   * @param {string} market - Market (Japan, HK, TW)
   * @param {Date} lastOrderDate - Date of last order
   * @param {Array} pointsHistory - Array of point transactions with dates
   * @param {Object} consumerData - Additional consumer data
   * @returns {string|null} - ISO date string of next expiration or null
   */
  calculateNextExpiration(consumerId, market = 'JP', lastOrderDate = null, pointsHistory = [], consumerData = null) {
    const config = this.expirationConfigs[market] || this.expirationConfigs['JP'];
    const now = new Date();

    // Use fiscal year calculation for HK/TW, rolling expiry for JP
    if (config.standardExpiry === 'fiscal_year') {
      return this.calculateFiscalYearExpiration(market, now);
    } else {
      return this.calculateJPExpiration(lastOrderDate, pointsHistory, now, consumerData);
    }
  }

  /**
   * Calculate expiration for JP market (yearly cumulative from last ORDER)
   */
  calculateJPExpiration(lastOrderDate, pointsHistory, now, consumerData = null) {
    const config = this.expirationConfigs['JP'];
    
    // Find the most recent qualifying event date
    const qualifyingDate = this.findMostRecentQualifyingDate(lastOrderDate, pointsHistory, ['PURCHASE', 'ORDER'], consumerData);
    
    if (!qualifyingDate) {
      return null;
    }

    // Add standard expiry period (yearly cumulative)
    const expirationDate = new Date(qualifyingDate);
    expirationDate.setDate(expirationDate.getDate() + config.expiryDays);
    
    return expirationDate.toISOString();
  }

  /**
   * Find the most recent qualifying date for expiration calculation
   * @param {Date|string} lastOrderDate - Explicit last order date
   * @param {Array} pointsHistory - Points transaction history
   * @param {Array} validEventTypes - Event types that qualify for expiration extension
   * @param {Object} consumerData - Additional consumer data including firstOrderDate
   * @returns {Date|null} - Most recent qualifying date
   */
  findMostRecentQualifyingDate(lastOrderDate, pointsHistory, validEventTypes, consumerData = null) {
    // If explicit date provided, use it
    if (lastOrderDate) {
      return typeof lastOrderDate === 'string' ? new Date(lastOrderDate) : lastOrderDate;
    }

    // Look for most recent qualifying event in history
    const qualifyingEvents = pointsHistory.filter(event => 
      validEventTypes.includes(event.eventType)
    );
    
    if (qualifyingEvents.length > 0) {
      // Sort by timestamp descending and get the most recent
      qualifyingEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return new Date(qualifyingEvents[0].timestamp);
    }

    // If no qualifying events found, check for firstOrderDate from consumer data
    if (consumerData && consumerData.firstOrderDate) {
      return new Date(consumerData.firstOrderDate);
    }

    // Fallback to registration event if no qualifying events found
    const registrationEvent = pointsHistory.find(event => event.eventType === 'REGISTRATION');
    if (registrationEvent) {
      return new Date(registrationEvent.timestamp);
    }

    return null;
  }

  /**
   * Calculate expiration for HK/TW markets (fiscal year-based)
   */
  calculateFiscalYearExpiration(market, now) {
    const config = this.expirationConfigs[market];
    const currentYear = now.getFullYear();
    
    // Determine current fiscal year
    const fiscalYearStart = new Date(currentYear, config.fiscalYearStart.month - 1, config.fiscalYearStart.day);
    const fiscalYearEnd = new Date(currentYear + 1, config.fiscalYearEnd.month - 1, config.fiscalYearEnd.day, 23, 59, 59, 999);
    
    // If we're past July 1, the fiscal year end is next year
    if (now >= fiscalYearStart) {
      return fiscalYearEnd.toISOString();
    } else {
      // We're in the period Jan-June, so fiscal year ends this year
      const currentFiscalEnd = new Date(currentYear, config.fiscalYearEnd.month - 1, config.fiscalYearEnd.day, 23, 59, 59, 999);
      return currentFiscalEnd.toISOString();
    }
  }

  /**
   * Check if points should be extended based on event type and market
   * @param {string} eventType - Type of event (ORDER, PURCHASE, INTERACTION, etc.)
   * @param {string} market - Market
   * @returns {boolean} - Whether expiration should be extended
   */
  shouldExtendExpiration(eventType, market = 'JP') {
    const config = this.expirationConfigs[market] || this.expirationConfigs['JP'];
    
    // Define extension-qualifying events per market
    const extensionEvents = {
      'JP': ['ORDER', 'PURCHASE'],
      'HK': ['ORDER', 'PURCHASE', 'INTERACTION', 'REGISTRATION'],
      'TW': ['ORDER', 'PURCHASE', 'INTERACTION', 'REGISTRATION']
    };
    
    const qualifyingEvents = extensionEvents[market] || extensionEvents['JP'];
    return qualifyingEvents.includes(eventType);
  }

  /**
   * Get expiration details for a consumer
   * @param {string} consumerId - Consumer ID
   * @param {string} market - Market
   * @param {Object} consumerData - Consumer data including balance and history
   * @returns {Object} - Expiration details
   */
  getExpirationDetails(consumerId, market, consumerData) {
    const pointsHistory = consumerData.history || [];
    const lastOrderDate = consumerData.lastOrderDate;
    
    const nextExpiration = this.calculateNextExpiration(consumerId, market, lastOrderDate, pointsHistory, consumerData);
    const config = this.expirationConfigs[market] || this.expirationConfigs['JP'];
    
    return {
      nextExpiration,
      expirationRule: config.standardExpiry,
      market,
      timezone: config.timezone,
      specialNotes: config.specialNotes,
      pointsExpiryType: config.interactionPointsExpiry
    };
  }

  /**
   * Process expiration for points (daily batch job simulation)
   * @param {string} market - Market to process
   * @returns {Array} - Array of consumers with expired points
   */
  processExpiredPoints(market = 'JP') {
    const now = new Date();
    const expiredConsumers = [];
    
    // This would typically be a batch job that processes all consumers
    // For demo purposes, we'll return the structure
    
    return {
      processedAt: now.toISOString(),
      market,
      expiredConsumers,
      totalExpiredPoints: 0,
    };
  }

  /**
   * Get market configuration
   * @param {string} market - Market code
   * @returns {Object} - Market configuration
   */
  getMarketConfig(market) {
    return this.expirationConfigs[market] || this.expirationConfigs['JP'];
  }
}

module.exports = PointsExpirationService;
