const RulesEngine = require('../../engine/RulesEngine');
const ValidationHelpers = require('../../engine/helpers/ValidationHelpers');
const { EventValidators } = require('../validators');
const consumerService = require('../../services/consumerService');
const logger = require('../utils/logger');

class EventsController {
  /**
   * Process a single event through the rules engine
   */
  static async processEvent(req, res, next) {
    try {
      const { eventId, eventType, timestamp, market, channel, consumerId, context, attributes } = req.body;

      // Sanitize event data
      const sanitizedEventData = EventValidators.sanitizeEventData(req.body);

      // Validate event data using the centralized validator
      const validation = await EventValidators.validateEvent(sanitizedEventData, consumerService);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation Error',
          message: validation.error,
          field: validation.field
        });
      }
      
      logger.info('Processing event', { eventId, eventType, consumerId });

      // Process event using the exact input format (no transformation needed)
      const eventData = {
        eventId,
        eventType,
        timestamp,
        market: market || 'JP',
        channel: channel || 'ONLINE',
        consumerId,
        context: context || {},
        attributes: attributes || {}
      };

      const rulesEngine = new RulesEngine();
      const result = await rulesEngine.processEvent(eventData);
      
      // Format response to match the generalized output template exactly
      const response = {
        consumerId: result.consumerId,
        eventId: result.eventId,
        eventType: result.eventType,
        totalPointsAwarded: result.totalPointsAwarded,
        pointBreakdown: result.pointBreakdown || [],
        errors: result.errors || [],
        resultingBalance: {
          total: result.resultingBalance?.total || 0,
          available: result.resultingBalance?.available || 0,
          used: result.resultingBalance?.used || 0,
          transactionCount: result.resultingBalance?.transactionCount || 1
        }
      };
      
      logger.info('Event processed successfully', { 
        eventId: result.eventId, 
        pointsAwarded: result.totalPointsAwarded 
      });
      
      res.json(response);
    } catch (error) {
      logger.error('Event processing error', error);
      next(error);
    }
  }

  /**
   * Process multiple events in a single request (for batch operations)
   */
  static async processBatch(req, res, next) {
    try {
      const { events } = req.body;
      
      if (!Array.isArray(events)) {
        return res.status(400).json({
          error: 'Invalid input',
          details: 'events must be an array'
        });
      }

      logger.info('Processing batch events', { count: events.length });

      const rulesEngine = new RulesEngine();
      const results = [];
      
      for (const event of events) {
        try {
          const result = await rulesEngine.processEvent(event);
          results.push(result);
        } catch (error) {
          logger.warn('Batch event processing failed', { eventId: event.eventId, error: error.message });
          results.push({
            eventId: event.eventId,
            error: error.message,
            success: false
          });
        }
      }
      
      logger.info('Batch processing completed', { processed: results.length });
      
      res.json({
        processed: results.length,
        results: results
      });
    } catch (error) {
      logger.error('Batch processing error', error);
      next(error);
    }
  }
}

module.exports = EventsController;
