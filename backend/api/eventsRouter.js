const express = require('express');
const router = express.Router();
const RulesEngine = require('../engine/RulesEngine');
const ValidationHelpers = require('../engine/helpers/ValidationHelpers');

/**
 * POST /api/events/process
 * Core API that processes all consumer events and computes points via the rule engine
 * Follows the generalized input/output template exactly
 */
router.post('/process', async (req, res) => {
  try {
    // Validate input using the engine's validation logic
    ValidationHelpers.validateEventData(req.body);
    
    const { eventId, eventType, timestamp, market, channel, productLine, consumerId, context, attributes } = req.body;

    // Process event using the exact input format (no transformation needed)
    const eventData = {
      eventId,
      eventType,
      timestamp,
      market: market || 'JP',
      channel: channel || 'ONLINE',
      productLine: productLine || 'PREMIUM_SERIES',
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
    
    res.json(response);
  } catch (error) {
    console.error('Event processing error:', error);
    res.status(500).json({
      error: 'Event processing failed',
      message: error.message,
      eventId: req.body.eventId
    });
  }
});

/**
 * POST /api/events/batch
 * Process multiple events in a single request (for batch operations)
 */
router.post('/batch', async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events)) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'events must be an array'
      });
    }

    const rulesEngine = new RulesEngine();
    const results = [];
    
    for (const event of events) {
      try {
        const result = await rulesEngine.processEvent(event);
        results.push(result);
      } catch (error) {
        results.push({
          eventId: event.eventId,
          error: error.message,
          success: false
        });
      }
    }
    
    res.json({
      processed: results.length,
      results: results
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    res.status(500).json({
      error: 'Batch processing failed',
      message: error.message
    });
  }
});

module.exports = router;
