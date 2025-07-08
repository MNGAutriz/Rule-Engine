const express = require('express');
const router = express.Router();
const CampaignController = require('../controllers/campaignController');

/**
 * GET /api/campaigns
 * Get all campaigns
 */
router.get('/', CampaignController.getAllCampaigns);

/**
 * GET /api/campaigns/active?startDate={optional}&endDate={optional}
 * Return currently active campaigns scoped by optional date range
 */
router.get('/active', CampaignController.getActiveCampaigns);

/**
 * POST /api/campaigns
 * Create a new campaign
 */
router.post('/', CampaignController.createCampaign);

/**
 * GET /api/campaigns/:campaignCode/analytics
 * Get campaign performance analytics
 */
router.get('/:campaignCode/analytics', CampaignController.getCampaignAnalytics);

/**
 * GET /api/campaigns/:campaignCode
 * Get a specific campaign by code
 */
router.get('/:campaignCode', CampaignController.getCampaignByCode);

/**
 * PUT /api/campaigns/:campaignCode
 * Update an existing campaign
 */
router.put('/:campaignCode', CampaignController.updateCampaign);

/**
 * DELETE /api/campaigns/:campaignCode
 * Delete a campaign
 */
router.delete('/:campaignCode', CampaignController.deleteCampaign);

module.exports = router;
