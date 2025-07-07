const express = require('express');
const router = express.Router();
const consumerService = require('../services/consumerService');
const RulesEngine = require('../engine/RulesEngine');

/**
 * GET /api/consumer/points?consumerId={id}
 * Return current point status for a given consumer
 * Follows the generalized output template exactly
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
    
    // Format response to match generalized template exactly
    const response = {
      consumerId: pointsData.consumerId,
      total: pointsData.total,
      available: pointsData.available,
      used: pointsData.used,
      pointsExpirationDate: pointsData.pointsExpirationDate,
      expirationPolicy: pointsData.expirationPolicy,
      market: pointsData.market,
      timezone: pointsData.timezone,
      transactionCount: pointsData.transactionCount
    };
    
    res.json(response);
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
 * Follows the generalized output template exactly
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
    
    // Format response to match generalized template exactly
    const response = history.map(entry => ({
      eventId: entry.eventId,
      timestamp: entry.timestamp,
      eventType: entry.eventType,
      points: entry.points,
      ruleId: entry.ruleId,
      description: entry.description
    }));
    
    res.json(response);
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

/**
 * POST /api/consumer/market
 * Set market for a consumer (for testing different expiration rules)
 */
router.post('/market', async (req, res) => {
  try {
    const { consumerId, market } = req.body;
    
    if (!consumerId || !market) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'consumerId and market are required'
      });
    }
    
    const validMarkets = ['JP', 'HK', 'TW'];
    if (!validMarkets.includes(market)) {
      return res.status(400).json({
        error: 'Invalid market',
        details: `Market must be one of: ${validMarkets.join(', ')}`
      });
    }
    
    const updatedConsumer = consumerService.setConsumerMarket(consumerId, market);
    res.json({
      success: true,
      consumerId,
      market,
      updatedConsumer
    });
  } catch (error) {
    console.error('Error setting consumer market:', error);
    res.status(500).json({
      error: 'Failed to set consumer market',
      message: error.message
    });
  }
});

/**
 * GET /api/consumer/expiration?consumerId={id}&market={optional}
 * Get detailed expiration information for a consumer
 */
router.get('/expiration', async (req, res) => {
  try {
    const { consumerId, market } = req.query;
    
    if (!consumerId) {
      return res.status(400).json({
        error: 'Missing required parameter',
        details: 'consumerId is required'
      });
    }
    
    const expirationDetails = consumerService.getExpirationDetails(consumerId, market);
    res.json(expirationDetails);
  } catch (error) {
    console.error('Error fetching expiration details:', error);
    res.status(500).json({
      error: 'Failed to fetch expiration details',
      message: error.message
    });
  }
});

/**
 * POST /api/consumer/validate-redemption
 * Validates if a redemption amount is possible based on available points
 */
router.post('/validate-redemption', async (req, res) => {
  try {
    const { consumerId, redemptionPoints } = req.body;
    
    if (!consumerId || !redemptionPoints) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'consumerId and redemptionPoints are required'
      });
    }

    if (redemptionPoints <= 0) {
      return res.status(400).json({
        valid: false,
        error: 'Redemption points must be greater than 0'
      });
    }

    // Get current balance
    const balance = consumerService.getBalance(consumerId);
    
    if (balance.available < redemptionPoints) {
      return res.json({
        valid: false,
        availablePoints: balance.available,
        requestedPoints: redemptionPoints,
        shortfall: redemptionPoints - balance.available,
        message: `Insufficient points. You have ${balance.available} available points, but are trying to redeem ${redemptionPoints} points.`
      });
    }

    return res.json({
      valid: true,
      availablePoints: balance.available,
      requestedPoints: redemptionPoints,
      remainingAfterRedemption: balance.available - redemptionPoints,
      message: 'Redemption is valid'
    });

  } catch (error) {
    console.error('Error validating redemption:', error);
    res.status(500).json({
      error: 'Failed to validate redemption',
      message: error.message
    });
  }
});

/**
 * POST /api/consumer/validate-recycling
 * Validates if a recycling count is within the yearly limit
 */
router.post('/validate-recycling', async (req, res) => {
  try {
    const { consumerId, recycledCount } = req.body;
    
    if (!consumerId || !recycledCount) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'consumerId and recycledCount are required'
      });
    }

    if (recycledCount <= 0) {
      return res.status(400).json({
        valid: false,
        error: 'Recycled count must be greater than 0'
      });
    }

    // Get user data to check recycling activity
    const user = consumerService.getConsumerById(consumerId);
    if (!user) {
      return res.status(404).json({
        error: 'Consumer not found'
      });
    }

    // Get current year recycling data
    const recyclingActivity = user.engagement?.recyclingActivity || {
      totalBottlesRecycled: 0,
      thisYearBottlesRecycled: 0,
      lastRecyclingDate: null
    };

    const maxBottlesPerYear = 5; // As defined in transaction rules
    const currentYearRecycled = recyclingActivity.thisYearBottlesRecycled || 0;
    const proposedTotal = currentYearRecycled + recycledCount;

    if (proposedTotal > maxBottlesPerYear) {
      const availableSlots = Math.max(0, maxBottlesPerYear - currentYearRecycled);
      return res.json({
        valid: false,
        currentYearRecycled: currentYearRecycled,
        requestedRecycling: recycledCount,
        maxPerYear: maxBottlesPerYear,
        availableSlots: availableSlots,
        exceedsBy: proposedTotal - maxBottlesPerYear,
        message: `Exceeds yearly limit. You have recycled ${currentYearRecycled} bottles this year and can recycle ${availableSlots} more (max ${maxBottlesPerYear}/year).`
      });
    }

    return res.json({
      valid: true,
      currentYearRecycled: currentYearRecycled,
      requestedRecycling: recycledCount,
      maxPerYear: maxBottlesPerYear,
      remainingSlots: maxBottlesPerYear - proposedTotal,
      message: `Recycling is valid. After this, you will have recycled ${proposedTotal} bottles this year.`
    });

  } catch (error) {
    console.error('Error validating recycling:', error);
    res.status(500).json({
      error: 'Failed to validate recycling',
      message: error.message
    });
  }
});

module.exports = router;
