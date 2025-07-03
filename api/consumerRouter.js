const express = require('express');
const router = express.Router();
const consumerService = require('../services/consumerService');

// Remove the line below - using the existing service
// const consumerService = new ConsumerService();

/**
 * GET /api/consumer/points?consumerId={id}
 * Return current point status for a given consumer
 */
router.get('/points', async (req, res) => {
  try {
    const { consumerId } = req.query;
    
    if (!consumerId) {
      return res.status(400).json({
        error: 'Missing required parameter',
        details: 'consumerId is required'
      });
    }

    const pointsData = await consumerService.getConsumerPoints(consumerId);
    res.json(pointsData);
  } catch (error) {
    console.error('Error fetching consumer points:', error);
    res.status(500).json({
      error: 'Failed to fetch consumer points',
      message: error.message
    });
  }
});

/**
 * GET /api/consumer/history?consumerId={id}
 * Returns chronological point activity for a consumer
 */
router.get('/history', async (req, res) => {
  try {
    const { consumerId, startDate, endDate, limit = 50 } = req.query;
    
    if (!consumerId) {
      return res.status(400).json({
        error: 'Missing required parameter',
        details: 'consumerId is required'
      });
    }

    const history = await consumerService.getConsumerHistory(
      consumerId, 
      { startDate, endDate, limit: parseInt(limit) }
    );
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching consumer history:', error);
    res.status(500).json({
      error: 'Failed to fetch consumer history',
      message: error.message
    });
  }
});

/**
 * GET /api/consumer/profile?consumerId={id}
 * Returns consumer profile information from CDP mockup
 */
router.get('/profile', async (req, res) => {
  try {
    const { consumerId } = req.query;
    
    if (!consumerId) {
      return res.status(400).json({
        error: 'Missing required parameter',
        details: 'consumerId is required'
      });
    }

    const profile = await consumerService.getConsumerProfile(consumerId);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching consumer profile:', error);
    res.status(500).json({
      error: 'Failed to fetch consumer profile',
      message: error.message
    });
  }
});

/**
 * PUT /api/consumer/profile
 * Updates consumer profile information (for testing purposes)
 */
router.put('/profile', async (req, res) => {
  try {
    const { consumerId, profileData } = req.body;
    
    if (!consumerId || !profileData) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'consumerId and profileData are required'
      });
    }

    const updatedProfile = await consumerService.updateConsumerProfile(consumerId, profileData);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating consumer profile:', error);
    res.status(500).json({
      error: 'Failed to update consumer profile',
      message: error.message
    });
  }
});

module.exports = router;
