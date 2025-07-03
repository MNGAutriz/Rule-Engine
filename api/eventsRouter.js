const express = require('express');
const router = express.Router();
const LoyaltyEngine = require('../engine/LoyaltyEngine');
const { validateEventInput } = require('../utils/validators');

/**
 * POST /api/events/process
 * Core API that processes all consumer events and computes points via the rule engine
 */
router.post('/process', async (req, res) => {
  try {
    // Validate input against generalized template
    const validationResult = validateEventInput(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validationResult.errors
      });
    }

    const loyaltyEngine = new LoyaltyEngine();
    const result = await loyaltyEngine.processEvent(req.body);
    
    res.json(result);
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

    const loyaltyEngine = new LoyaltyEngine();
    const results = [];
    
    for (const event of events) {
      try {
        const result = await loyaltyEngine.processEvent(event);
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
