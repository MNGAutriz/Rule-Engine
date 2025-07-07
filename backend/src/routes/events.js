const express = require('express');
const router = express.Router();
const { EventsController } = require('../controllers');

/**
 * POST /api/events/process
 * Core API that processes all consumer events and computes points via the rule engine
 */
router.post('/process', EventsController.processEvent);

/**
 * POST /api/events/batch
 * Process multiple events in a single request (for batch operations)
 */
router.post('/batch', EventsController.processBatch);

module.exports = router;
