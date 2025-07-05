const express = require('express');
const router = express.Router();
const RulesEngine = require('../engine/RulesEngine');
const { validateEventInput } = require('../utils/validators');

/**
 * POST /api/events/process
 * Core API that processes all consumer events and computes points via the rule engine
 * Input format matches the specified template with eventId, eventType, timestamp, market, channel, etc.
 */
router.post('/process', async (req, res) => {
  try {
    // Validate input - the new format can include market, channel, productLine, context, attributes
    const { eventId, eventType, timestamp, consumerId, market, channel, productLine, context, attributes } = req.body;
    
    if (!eventId || !eventType || !timestamp || !consumerId) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'eventId, eventType, timestamp, and consumerId are required'
      });
    }

    // Convert to internal format for processing - flatten the structure
    const internalEvent = {
      eventId,
      consumerId,
      eventType,
      timestamp,
      market: market || 'JP',
      channel: channel || 'ONLINE',
      productLine: productLine || 'STANDARD',
      context: context || {},
      attributes: attributes || {},
      // For manual adjustments, extract points from attributes
      ...(eventType === 'ADJUSTMENT' && attributes?.adjustmentAmount ? {
        adjustmentAmount: attributes.adjustmentAmount,
        reason: attributes.reason || 'Manual adjustment',
        adminId: attributes.adminId || 'system'
      } : {})
    };

    const rulesEngine = new RulesEngine();
    const result = await rulesEngine.processEvent(internalEvent);
    
    // Format response to match the expected output structure
    const response = {
      consumerId: result.consumerId,
      eventId: result.eventId,
      eventType: result.eventType,
      totalPointsAwarded: result.totalPointsAwarded,
      pointBreakdown: result.pointBreakdown || [],
      errors: result.errors || [],
      resultingBalance: result.resultingBalance || {
        total: result.newBalance?.total || 0,
        available: result.newBalance?.available || 0,
        used: result.newBalance?.used || 0,
        version: result.newBalance?.version || 1
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
