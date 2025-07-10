/**
 * Validation Helpers - Contains all validation logic for events and data
 * Ensures data integrity and proper format validation
 */
class ValidationHelpers {

  /**
   * Validate event data according to the generalized input template
   * Market can be optional if consumerId is provided (will be fetched from CDP)
   */
  static validateEventData(eventData) {
    // Required fields from generalized input template
    const requiredFields = [
      'eventId', 'eventType', 'timestamp', 
      'channel', 'consumerId'
    ];
    
    const missing = requiredFields.filter(field => !eventData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Market is optional if consumerId is provided (will be fetched from CDP)
    if (eventData.market) {
      // Validate market if provided
      this.validateMarket(eventData.market);
    } else if (!eventData.consumerId) {
      throw new Error('Either market or consumerId must be provided');
    }
    
    // Validate event type
    this.validateEventType(eventData.eventType);
    
    // Validate timestamp
    this.validateTimestamp(eventData.timestamp);
    
    // Validate consumer ID
    this.validateConsumerId(eventData.consumerId);
  }

  /**
   * Validate market value
   */
  static validateMarket(market) {
    const validMarkets = ['JP', 'HK', 'TW'];
    if (!validMarkets.includes(market)) {
      throw new Error(`Invalid market: ${market}. Must be one of: ${validMarkets.join(', ')}`);
    }
  }

  /**
   * Validate event type
   */
  static validateEventType(eventType) {
    const validEventTypes = [
      'PURCHASE', 'REGISTRATION', 'RECYCLE', 'CONSULTATION', 'ADJUSTMENT', 'REDEMPTION'
    ];
    if (!validEventTypes.includes(eventType)) {
      throw new Error(`Invalid event type: ${eventType}. Must be one of: ${validEventTypes.join(', ')}`);
    }
  }

  /**
   * Validate timestamp format
   */
  static validateTimestamp(timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid timestamp format: ${timestamp}. Must be a valid ISO 8601 datetime.`);
    }
    
    // Check if timestamp is not too far in the future
    const now = new Date();
    const maxFutureDate = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
    
    if (date > maxFutureDate) {
      throw new Error(`Timestamp cannot be more than 24 hours in the future: ${timestamp}`);
    }
  }

  /**
   * Validate consumer ID format
   */
  static validateConsumerId(consumerId) {
    if (!consumerId || typeof consumerId !== 'string' || consumerId.trim().length === 0) {
      throw new Error('Consumer ID must be a non-empty string');
    }
    
    // Additional validation can be added here (format, length, etc.)
    if (consumerId.length > 100) {
      throw new Error('Consumer ID cannot exceed 100 characters');
    }
  }

  /**
   * Validate recycling event data and limits
   */
  static validateRecyclingEvent(eventData, consumerService) {
    if (eventData.eventType !== 'RECYCLE') {
      return; // Not a recycling event, skip validation
    }

    // Validate required fields for recycling
    if (!eventData.attributes?.recycledCount) {
      throw new Error('recycledCount is required for RECYCLE events');
    }

    const recycledCount = eventData.attributes.recycledCount;

    // Validate recycledCount is a positive number
    if (!Number.isInteger(recycledCount) || recycledCount <= 0) {
      throw new Error('recycledCount must be a positive integer');
    }

    if (recycledCount > 10) {
      throw new Error('Cannot recycle more than 10 bottles in a single event');
    }

    // Check yearly bottle limits
    const user = consumerService.getConsumerById(eventData.consumerId);
    if (user && user.engagement?.recyclingActivity) {
      const recyclingActivity = user.engagement.recyclingActivity;
      const maxBottlesPerYear = 5; // As defined in transaction rules
      const currentYearRecycled = recyclingActivity.thisYearBottlesRecycled || 0;
      const proposedTotal = currentYearRecycled + recycledCount;
      
      if (proposedTotal > maxBottlesPerYear) {
        const availableSlots = Math.max(0, maxBottlesPerYear - currentYearRecycled);
        throw new Error(`Recycling limit exceeded. You have recycled ${currentYearRecycled} bottles this year and can only recycle ${availableSlots} more (max ${maxBottlesPerYear}/year). Requested: ${recycledCount}`);
      }
    }
  }

  /**
   * Validate redemption event data and available points
   */
  static validateRedemptionEvent(eventData, consumerService) {
    if (eventData.eventType !== 'REDEMPTION') {
      return; // Not a redemption event, skip validation
    }

    // Validate required fields for redemption
    if (!eventData.attributes?.redemptionPoints) {
      throw new Error('redemptionPoints is required for REDEMPTION events');
    }

    const redemptionPoints = eventData.attributes.redemptionPoints;

    // Validate redemptionPoints is a positive number
    if (!Number.isInteger(redemptionPoints) || redemptionPoints <= 0) {
      throw new Error('redemptionPoints must be a positive integer');
    }

    if (redemptionPoints > 100000) {
      throw new Error('Cannot redeem more than 100,000 points in a single transaction');
    }

    // Check available balance
    const currentBalance = consumerService.getBalance(eventData.consumerId);
    if (currentBalance.available < redemptionPoints) {
      throw new Error(`Insufficient points for redemption. Available: ${currentBalance.available}, Requested: ${redemptionPoints}`);
    }
  }

  /**
   * Validate purchase event data
   */
  static validatePurchaseEvent(eventData) {
    if (eventData.eventType !== 'PURCHASE') {
      return; // Not a purchase event, skip validation
    }

    // Validate required fields for purchase
    if (!eventData.attributes?.amount) {
      throw new Error('amount is required for PURCHASE events');
    }

    const amount = eventData.attributes.amount;

    // Validate amount is a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('amount must be a positive number');
    }

    if (amount > 1000000) {
      throw new Error('Purchase amount cannot exceed 1,000,000');
    }
  }

  /**
   * Validate consultation event data
   */
  static validateConsultationEvent(eventData) {
    if (eventData.eventType !== 'CONSULTATION') {
      return; // Not a consultation event, skip validation
    }

    // Validate consultation type if provided
    if (eventData.attributes?.consultationType) {
      const validTypes = ['BEAUTY_CONSULTATION', 'PRODUCT_RECOMMENDATION', 'SKIN_ANALYSIS', 'VIRTUAL_CONSULTATION'];
      if (!validTypes.includes(eventData.attributes.consultationType)) {
        throw new Error(`Invalid consultation type: ${eventData.attributes.consultationType}. Must be one of: ${validTypes.join(', ')}`);
      }
    }
  }

  /**
   * Validate adjustment event data
   */
  static validateAdjustmentEvent(eventData) {
    if (eventData.eventType !== 'ADJUSTMENT') {
      return; // Not an adjustment event, skip validation
    }

    // Validate required fields for adjustment (support both adjustmentPoints and adjustedPoints)
    const adjustmentPoints = eventData.attributes?.adjustmentPoints || eventData.attributes?.adjustedPoints;
    if (!adjustmentPoints && adjustmentPoints !== 0) {
      throw new Error('adjustmentPoints or adjustedPoints is required for ADJUSTMENT events');
    }

    // Allow either reason or note for explanation
    const reason = eventData.attributes?.reason || eventData.attributes?.note;
    if (!reason) {
      throw new Error('reason or note is required for ADJUSTMENT events');
    }

    // Validate adjustmentPoints is a number (can be negative)
    if (typeof adjustmentPoints !== 'number') {
      throw new Error('adjustmentPoints must be a number');
    }

    if (Math.abs(adjustmentPoints) > 50000) {
      throw new Error('Adjustment cannot exceed 50,000 points in either direction');
    }

    // Validate reason - allow predefined reasons or custom text
    const validReasons = ['CUSTOMER_SERVICE', 'PROMOTION_CORRECTION', 'SYSTEM_ERROR', 'MANAGER_OVERRIDE'];
    
    // If reason is not in predefined list, treat it as custom reason (which is allowed)
    // Custom reasons should be descriptive and not empty
    if (!validReasons.includes(reason)) {
      if (!reason || reason.trim().length < 5) {
        throw new Error('Custom adjustment reason must be at least 5 characters long and descriptive');
      }
      if (reason.trim().length > 200) {
        throw new Error('Adjustment reason cannot exceed 200 characters');
      }
    }
  }

  /**
   * Comprehensive event validation - validates all event types
   */
  static validateCompleteEvent(eventData, consumerService) {
    // First validate basic event structure
    this.validateEventData(eventData);

    // Then validate event-specific data
    this.validateRecyclingEvent(eventData, consumerService);
    this.validateRedemptionEvent(eventData, consumerService);
    this.validatePurchaseEvent(eventData);
    this.validateConsultationEvent(eventData);
    this.validateAdjustmentEvent(eventData);
  }
}

module.exports = ValidationHelpers;
