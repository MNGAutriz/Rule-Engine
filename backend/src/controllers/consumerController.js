const consumerService = require('../../services/consumerService');
const logger = require('../utils/logger');

class ConsumerController {
  /**
   * Get current point status for a given consumer
   */
  static async getPoints(req, res, next) {
    try {
      const { consumerId } = req.query;
      
      if (!consumerId) {
        return res.status(400).json({
          error: 'Missing required parameter',
          details: 'consumerId is required'
        });
      }
      
      logger.info('Fetching consumer points', { consumerId });
      
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
      logger.error('Error fetching consumer points', error);
      next(error);
    }
  }

  /**
   * Get chronological point activity for a consumer
   */
  static async getHistory(req, res, next) {
    try {
      const { consumerId, page, limit, startDate, endDate } = req.query;
      
      if (!consumerId) {
        return res.status(400).json({
          error: 'Missing required parameter',
          details: 'consumerId is required'
        });
      }
      
      // Parse pagination parameters with defaults
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 5; // Default to 5 items per page
      
      logger.info('Fetching consumer history', { 
        consumerId, 
        page: pageNum, 
        limit: limitNum, 
        startDate, 
        endDate 
      });
      
      const options = {
        page: pageNum,
        limit: limitNum
      };
      
      if (startDate) options.startDate = startDate;
      if (endDate) options.endDate = endDate;
      
      const historyData = await consumerService.getConsumerHistory(consumerId, options);
      
      res.json(historyData);
    } catch (error) {
      logger.error('Error fetching consumer history', error);
      next(error);
    }
  }

  /**
   * Get available consumers for frontend dropdowns
   */
  static async getAvailableConsumers(req, res, next) {
    try {
      logger.info('Fetching available consumers');
      
      const consumers = await consumerService.getAvailableConsumers();
      
      res.json({ consumers });
    } catch (error) {
      logger.error('Error fetching available consumers', error);
      next(error);
    }
  }

  /**
   * Reset consumer data for testing purposes
   */
  static async resetConsumerData(req, res, next) {
    try {
      const { consumerId } = req.params;
      const { resetType, targetValue } = req.body;
      
      if (!consumerId) {
        return res.status(400).json({
          error: 'Missing required parameter',
          details: 'consumerId is required'
        });
      }
      
      logger.info('Resetting consumer data', { consumerId, resetType, targetValue });
      
      let result;
      switch (resetType) {
        case 'balance':
          result = await consumerService.resetBalance(consumerId, targetValue);
          break;
        case 'purchaseCount':
          result = await consumerService.resetPurchaseCount(consumerId, targetValue);
          break;
        default:
          return res.status(400).json({
            error: 'Invalid reset type',
            details: 'resetType must be one of: balance, purchaseCount'
          });
      }
      
      res.json({ 
        success: true, 
        message: `${resetType} reset successfully`,
        result 
      });
    } catch (error) {
      logger.error('Error resetting consumer data', error);
      next(error);
    }
  }

  /**
   * Validate redemption request
   */
  static async validateRedemption(req, res, next) {
    try {
      const { consumerId, redemptionPoints } = req.body;
      
      if (!consumerId || !redemptionPoints) {
        return res.status(400).json({
          error: 'Missing required parameters',
          details: 'consumerId and redemptionPoints are required'
        });
      }

      logger.info('Validating redemption', { consumerId, redemptionPoints });

      // Get current balance
      const currentBalance = await consumerService.getBalance(consumerId);
      
      // Check if redemption is possible
      if (currentBalance.available < redemptionPoints) {
        return res.json({
          valid: false,
          message: `Insufficient points for redemption. Available: ${currentBalance.available}, Requested: ${redemptionPoints}`,
          available: currentBalance.available,
          requested: redemptionPoints,
          shortfall: redemptionPoints - currentBalance.available
        });
      }

      // Redemption is valid
      const remainingAfterRedemption = currentBalance.available - redemptionPoints;
      
      res.json({
        valid: true,
        message: `Redemption validated successfully`,
        available: currentBalance.available,
        requested: redemptionPoints,
        remainingAfterRedemption
      });
    } catch (error) {
      logger.error('Error validating redemption', error);
      next(error);
    }
  }

  /**
   * Validate recycling request
   */
  static async validateRecycling(req, res, next) {
    try {
      const { consumerId, recycledCount } = req.body;
      
      if (!consumerId || !recycledCount) {
        return res.status(400).json({
          error: 'Missing required parameters',
          details: 'consumerId and recycledCount are required'
        });
      }

      logger.info('Validating recycling', { consumerId, recycledCount });

      // Validate recycledCount is positive
      if (recycledCount <= 0 || !Number.isInteger(recycledCount)) {
        return res.json({
          valid: false,
          message: 'recycledCount must be a positive integer',
          recycledCount
        });
      }

      // Check yearly bottle limits
      const user = await consumerService.getConsumerById(consumerId);
      const maxBottlesPerYear = 5; // As defined in transaction rules
      const currentYearRecycled = user?.engagement?.recyclingActivity?.thisYearBottlesRecycled || 0;
      const proposedTotal = currentYearRecycled + recycledCount;
      
      if (proposedTotal > maxBottlesPerYear) {
        const availableSlots = Math.max(0, maxBottlesPerYear - currentYearRecycled);
        return res.json({
          valid: false,
          message: `Recycling limit exceeded. You have recycled ${currentYearRecycled} bottles this year and can only recycle ${availableSlots} more (max ${maxBottlesPerYear}/year)`,
          currentYearRecycled,
          requested: recycledCount,
          maxPerYear: maxBottlesPerYear,
          availableSlots
        });
      }

      // Recycling is valid
      res.json({
        valid: true,
        message: `Recycling validated successfully. You can recycle ${recycledCount} bottles.`,
        currentYearRecycled,
        requested: recycledCount,
        maxPerYear: maxBottlesPerYear,
        remainingSlots: maxBottlesPerYear - proposedTotal
      });
    } catch (error) {
      logger.error('Error validating recycling', error);
      next(error);
    }
  }
}

module.exports = ConsumerController;
