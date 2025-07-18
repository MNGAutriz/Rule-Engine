const CampaignService = require('../../services/CampaignService');
const logger = require('../utils/logger');

class CampaignController {
  constructor() {
    this.campaignService = new CampaignService();
  }

  /**
   * Get all campaigns
   */
  async getAllCampaigns(req, res, next) {
    try {
      logger.info('Fetching all campaigns');
      
      const campaigns = await this.campaignService.getAllCampaigns();
      
      res.json(campaigns);
    } catch (error) {
      logger.error('Error fetching campaigns', error);
      next(error);
    }
  }

  /**
   * Get currently active campaigns scoped by optional date range
   */
  async getActiveCampaigns(req, res, next) {
    try {
      const { startDate, endDate, market, channel } = req.query;
      
      logger.info('Fetching active campaigns', { market, channel });
      
      const filters = {
        startDate,
        endDate,
        market,
        channel
      };
      
      const activeCampaigns = await this.campaignService.getActiveCampaigns(filters);
      
      // Return full campaign objects with all fields
      res.json(activeCampaigns);
    } catch (error) {
      logger.error('Error fetching active campaigns', error);
      next(error);
    }
  }

  /**
   * Create a new campaign
   */
  async createCampaign(req, res, next) {
    try {
      const campaignData = req.body;
      
      logger.info('Creating new campaign', { campaignCode: campaignData.campaignCode });
      
      const result = await this.campaignService.createCampaign(campaignData);
      
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating campaign', error);
      if (error.message === 'Campaign code already exists') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Update an existing campaign
   */
  async updateCampaign(req, res, next) {
    try {
      const { campaignCode } = req.params;
      const updateData = req.body;
      
      logger.info('Updating campaign', { campaignCode });
      
      const result = await this.campaignService.updateCampaign(campaignCode, updateData);
      
      res.json(result);
    } catch (error) {
      logger.error('Error updating campaign', error);
      if (error.message === 'Campaign not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Campaign code already exists') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(req, res, next) {
    try {
      const { campaignCode } = req.params;
      
      logger.info('Deleting campaign', { campaignCode });
      
      await this.campaignService.deleteCampaign(campaignCode);
      
      res.json({
        success: true,
        message: 'Campaign deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting campaign', error);
      if (error.message === 'Campaign not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Get a specific campaign by code
   */
  async getCampaignByCode(req, res, next) {
    try {
      const { campaignCode } = req.params;
      
      logger.info('Fetching campaign by code', { campaignCode });
      
      const campaign = await this.campaignService.getCampaignByCode(campaignCode);
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
      
      // Return campaign with status field
      res.json({
        ...campaign,
        status: this.campaignService.getCampaignStatus(campaign)
      });
    } catch (error) {
      logger.error('Error fetching campaign by code', error);
      next(error);
    }
  }

  /**
   * Get campaign performance analytics
   */
  async getCampaignAnalytics(req, res, next) {
    try {
      const { campaignCode } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!campaignCode) {
        return res.status(400).json({
          error: 'Missing required parameter',
          details: 'campaignCode is required'
        });
      }
      
      logger.info('Fetching campaign analytics', { campaignCode, startDate, endDate });
      
      const analytics = await this.campaignService.getCampaignAnalytics(campaignCode, { startDate, endDate });
      
      res.json(analytics);
    } catch (error) {
      logger.error('Error fetching campaign analytics', error);
      next(error);
    }
  }
}

// Create and export controller instance
const campaignController = new CampaignController();

module.exports = {
  getAllCampaigns: campaignController.getAllCampaigns.bind(campaignController),
  getActiveCampaigns: campaignController.getActiveCampaigns.bind(campaignController),
  getCampaignByCode: campaignController.getCampaignByCode.bind(campaignController),
  createCampaign: campaignController.createCampaign.bind(campaignController),
  updateCampaign: campaignController.updateCampaign.bind(campaignController),
  deleteCampaign: campaignController.deleteCampaign.bind(campaignController),
  getCampaignAnalytics: campaignController.getCampaignAnalytics.bind(campaignController)
};
