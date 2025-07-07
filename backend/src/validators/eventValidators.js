/**
 * Event Validators - Centralized validation for all event types
 * Located in src/validators for proper organization
 */

const ValidationHelpers = require('../../engine/helpers/ValidationHelpers');
const { logger } = require('../utils');

class EventValidators {
  
  /**
   * Validate an event comprehensively before processing
   */
  static async validateEvent(eventData, consumerService) {
    try {
      // Use the comprehensive validation from ValidationHelpers
      ValidationHelpers.validateCompleteEvent(eventData, consumerService);
      
      logger.info('Event validation passed', {
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        consumerId: eventData.consumerId
      });
      
      return { isValid: true };
    } catch (error) {
      logger.warn('Event validation failed', {
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        consumerId: eventData.consumerId,
        error: error.message
      });
      
      return { 
        isValid: false, 
        error: error.message,
        field: this.extractFieldFromError(error.message)
      };
    }
  }

  /**
   * Extract field name from validation error message
   */
  static extractFieldFromError(errorMessage) {
    if (errorMessage.includes('recycledCount')) return 'recycledCount';
    if (errorMessage.includes('redemptionPoints')) return 'redemptionPoints';
    if (errorMessage.includes('amount')) return 'amount';
    if (errorMessage.includes('adjustmentPoints')) return 'adjustmentPoints';
    if (errorMessage.includes('reason')) return 'reason';
    if (errorMessage.includes('consultationType')) return 'consultationType';
    if (errorMessage.includes('Consumer ID')) return 'consumerId';
    if (errorMessage.includes('timestamp')) return 'timestamp';
    if (errorMessage.includes('market')) return 'market';
    if (errorMessage.includes('event type')) return 'eventType';
    if (errorMessage.includes('Recycling limit')) return 'recycledCount';
    if (errorMessage.includes('Insufficient points')) return 'redemptionPoints';
    if (errorMessage.includes('Adjustment cannot exceed')) return 'adjustmentPoints';
    if (errorMessage.includes('Invalid adjustment reason')) return 'reason';
    if (errorMessage.includes('Invalid consultation type')) return 'consultationType';
    return 'general';
  }

  /**
   * Validate event data for API endpoints
   */
  static validateEventForAPI(eventData) {
    const errors = [];

    // Basic required fields
    if (!eventData.eventId) errors.push('eventId is required');
    if (!eventData.consumerId) errors.push('consumerId is required');
    if (!eventData.eventType) errors.push('eventType is required');
    if (!eventData.timestamp) errors.push('timestamp is required');
    if (!eventData.channel) errors.push('channel is required');

    // Event-specific validations
    switch (eventData.eventType) {
      case 'PURCHASE':
        // productLine is optional for PURCHASE events
        if (!eventData.attributes?.amount) errors.push('amount is required for PURCHASE events');
        break;
      case 'RECYCLE':
        if (!eventData.attributes?.recycledCount) errors.push('recycledCount is required for RECYCLE events');
        break;
      case 'REDEMPTION':
        if (!eventData.attributes?.redemptionPoints) errors.push('redemptionPoints is required for REDEMPTION events');
        break;
      case 'ADJUSTMENT':
        if (eventData.attributes?.adjustmentPoints === undefined) errors.push('adjustmentPoints is required for ADJUSTMENT events');
        if (!eventData.attributes?.reason) errors.push('reason is required for ADJUSTMENT events');
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize event data before processing
   */
  static sanitizeEventData(eventData) {
    const sanitized = { ...eventData };

    // Trim string fields
    if (sanitized.eventId) sanitized.eventId = sanitized.eventId.trim();
    if (sanitized.consumerId) sanitized.consumerId = sanitized.consumerId.trim();
    if (sanitized.eventType) sanitized.eventType = sanitized.eventType.trim().toUpperCase();
    if (sanitized.channel) sanitized.channel = sanitized.channel.trim().toUpperCase();
    if (sanitized.productLine) sanitized.productLine = sanitized.productLine.trim();

    // Convert numeric fields
    if (sanitized.attributes) {
      if (sanitized.attributes.amount !== undefined) {
        sanitized.attributes.amount = Number(sanitized.attributes.amount);
      }
      if (sanitized.attributes.recycledCount !== undefined) {
        sanitized.attributes.recycledCount = Number(sanitized.attributes.recycledCount);
      }
      if (sanitized.attributes.redemptionPoints !== undefined) {
        sanitized.attributes.redemptionPoints = Number(sanitized.attributes.redemptionPoints);
      }
      if (sanitized.attributes.adjustmentPoints !== undefined) {
        sanitized.attributes.adjustmentPoints = Number(sanitized.attributes.adjustmentPoints);
      }
    }

    return sanitized;
  }
}

module.exports = EventValidators;
