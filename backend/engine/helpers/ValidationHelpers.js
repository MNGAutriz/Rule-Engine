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
    
    // ProductLine is not required for all event types
    const eventTypesRequiringProductLine = ['PURCHASE'];
    if (eventTypesRequiringProductLine.includes(eventData.eventType) && !eventData.productLine) {
      requiredFields.push('productLine');
    }
    
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
}

module.exports = ValidationHelpers;
