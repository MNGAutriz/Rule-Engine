const express = require('express');
const router = express.Router();
const CampaignService = require('../services/CampaignService');

const campaignService = new CampaignService();

/**
 * GET /api/campaigns/active?startDate={optional}&endDate={optional}
 * Return currently active campaigns scoped by optional date range
 */
router.get('/active', async (req, res) => {
  try {
    const { startDate, endDate, market, channel, productLine } = req.query;
    
    const filters = {
      startDate,
      endDate,
      market,
      channel,
      productLine
    };
    
    const activeCampaigns = await campaignService.getActiveCampaigns(filters);
    res.json(activeCampaigns);
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    res.status(500).json({
      error: 'Failed to fetch active campaigns',
      message: error.message
    });
  }
});

/**
 * GET /api/campaigns/:campaignId
 * Get details of a specific campaign
 */
router.get('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await campaignService.getCampaignById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found',
        campaignId
      });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign',
      message: error.message
    });
  }
});

/**
 * POST /api/campaigns
 * Create a new campaign (for admin purposes)
 */
router.post('/', async (req, res) => {
  try {
    const campaignData = req.body;
    
    // Basic validation
    const requiredFields = ['campaignCode', 'name', 'startDate', 'endDate', 'market'];
    const missingFields = requiredFields.filter(field => !campaignData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: missingFields
      });
    }
    
    const newCampaign = await campaignService.createCampaign(campaignData);
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

/**
 * PUT /api/campaigns/:campaignId
 * Update an existing campaign
 */
router.put('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const updateData = req.body;
    
    const updatedCampaign = await campaignService.updateCampaign(campaignId, updateData);
    
    if (!updatedCampaign) {
      return res.status(404).json({
        error: 'Campaign not found',
        campaignId
      });
    }
    
    res.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      error: 'Failed to update campaign',
      message: error.message
    });
  }
});

/**
 * DELETE /api/campaigns/:campaignId
 * Deactivate a campaign
 */
router.delete('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const result = await campaignService.deactivateCampaign(campaignId);
    
    if (!result) {
      return res.status(404).json({
        error: 'Campaign not found',
        campaignId
      });
    }
    
    res.json({ message: 'Campaign deactivated successfully', campaignId });
  } catch (error) {
    console.error('Error deactivating campaign:', error);
    res.status(500).json({
      error: 'Failed to deactivate campaign',
      message: error.message
    });
  }
});

module.exports = router;
