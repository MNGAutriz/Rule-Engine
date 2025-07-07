const express = require('express');
const router = express.Router();
const { ConsumerController } = require('../controllers');

/**
 * GET /api/consumer/points?consumerId={id}
 * Return current point status for a given consumer
 */
router.get('/points', ConsumerController.getPoints);

/**
 * GET /api/consumer/history?consumerId={id}
 * Returns chronological point activity for a consumer
 */
router.get('/history', ConsumerController.getHistory);

/**
 * GET /api/consumer/available
 * Get available consumers for frontend dropdowns
 */
router.get('/available', ConsumerController.getAvailableConsumers);

/**
 * POST /api/consumer/:consumerId/reset
 * Reset consumer data for testing purposes
 */
router.post('/:consumerId/reset', ConsumerController.resetConsumerData);

/**
 * POST /api/consumer/validate-redemption
 * Validate if a redemption is possible for a consumer
 */
router.post('/validate-redemption', ConsumerController.validateRedemption);

/**
 * POST /api/consumer/validate-recycling
 * Validate if a recycling event is possible for a consumer
 */
router.post('/validate-recycling', ConsumerController.validateRecycling);

module.exports = router;
