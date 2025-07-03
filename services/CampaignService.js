const { v4: uuidv4 } = require('uuid');

/**
 * Campaign Service - Manages campaign data and business logic
 * Follows the design template for campaign management
 */
class CampaignService {
  constructor() {
    // Mock campaign data - in production this would be from database
    this.campaigns = [
      {
        campaignId: 'c0a1b2c3-d4e5-6789-hk01-abcde123456f',
        campaignCode: 'CAMP2025SUMMER',
        name: 'Summer Double Points',
        market: 'HK',
        channel: 'LINE',
        productLine: 'PREMIUM_SERIES',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-07-15T23:59:59Z',
        ruleIds: ['FLEXIBLE_CAMPAIGN_BONUS'],
        isActive: true,
        priority: 1,
        description: 'Summer campaign with fixed bonus points',
        terms: 'Valid for purchases above HKD 500'
      },
      {
        campaignId: 'c1b2c3d4-e5f6-7890-jp02-bcdef234567g',
        campaignCode: 'CAMP2025BIRTHDAY',
        name: 'Birthday Month Special',
        market: 'JP',
        channel: 'ALL',
        productLine: 'PREMIUM_SERIES',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        ruleIds: ['FIRST_PURCHASE_BIRTH_MONTH_BONUS'],
        isActive: true,
        priority: 2,
        description: 'Birthday month bonus for first purchase',
        terms: 'Valid only during customer birth month'
      },
      {
        campaignId: 'c2c3d4e5-f6g7-8901-tw03-cdefg345678h',
        campaignCode: 'CAMP2025VIP',
        name: 'VIP Exclusive Multiplier',
        market: 'TW',
        channel: 'COUNTER',
        productLine: 'PREMIUM_SERIES',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
        ruleIds: ['FLEXIBLE_VIP_MULTIPLIER'],
        isActive: true,
        priority: 3,
        description: 'VIP customers get 2x points at VIP counters',
        terms: 'Valid only at designated VIP store locations'
      },
      {
        campaignId: 'c3d4e5f6-g7h8-9012-hk04-defgh456789i',
        campaignCode: 'CAMP2025COMBO',
        name: 'Product Combo Bonus',
        market: 'HK',
        channel: 'ALL',
        productLine: 'ESSENCE_SERIES',
        startDate: '2025-06-15T00:00:00Z',
        endDate: '2025-07-31T23:59:59Z',
        ruleIds: ['FLEXIBLE_COMBO_PRODUCT_MULTIPLIER'],
        isActive: true,
        priority: 2,
        description: 'Bonus points for purchasing product combinations',
        terms: 'Must purchase all items in combo set'
      }
    ];
  }

  /**
   * Get active campaigns with optional filters
   */
  async getActiveCampaigns(filters = {}) {
    const now = new Date();
    let activeCampaigns = this.campaigns.filter(campaign => {
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      
      return campaign.isActive && startDate <= now && endDate >= now;
    });

    // Apply filters
    if (filters.market) {
      activeCampaigns = activeCampaigns.filter(c => 
        c.market === filters.market || c.market === 'ALL'
      );
    }
    
    if (filters.channel) {
      activeCampaigns = activeCampaigns.filter(c => 
        c.channel === filters.channel || c.channel === 'ALL'
      );
    }
    
    if (filters.productLine) {
      activeCampaigns = activeCampaigns.filter(c => 
        c.productLine === filters.productLine || c.productLine === 'ALL'
      );
    }
    
    if (filters.startDate) {
      const filterStart = new Date(filters.startDate);
      activeCampaigns = activeCampaigns.filter(c => 
        new Date(c.startDate) >= filterStart
      );
    }
    
    if (filters.endDate) {
      const filterEnd = new Date(filters.endDate);
      activeCampaigns = activeCampaigns.filter(c => 
        new Date(c.endDate) <= filterEnd
      );
    }

    // Sort by priority
    activeCampaigns.sort((a, b) => a.priority - b.priority);

    return activeCampaigns;
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(campaignId) {
    return this.campaigns.find(c => c.campaignId === campaignId) || null;
  }

  /**
   * Get campaign by code
   */
  async getCampaignByCode(campaignCode) {
    return this.campaigns.find(c => c.campaignCode === campaignCode) || null;
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData) {
    const newCampaign = {
      campaignId: uuidv4(),
      isActive: true,
      priority: campaignData.priority || 10,
      ...campaignData
    };

    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  /**
   * Update an existing campaign
   */
  async updateCampaign(campaignId, updateData) {
    const campaignIndex = this.campaigns.findIndex(c => c.campaignId === campaignId);
    
    if (campaignIndex === -1) {
      return null;
    }

    this.campaigns[campaignIndex] = {
      ...this.campaigns[campaignIndex],
      ...updateData
    };

    return this.campaigns[campaignIndex];
  }

  /**
   * Deactivate a campaign
   */
  async deactivateCampaign(campaignId) {
    const campaignIndex = this.campaigns.findIndex(c => c.campaignId === campaignId);
    
    if (campaignIndex === -1) {
      return false;
    }

    this.campaigns[campaignIndex].isActive = false;
    return true;
  }

  /**
   * Get campaigns applicable to an event
   */
  async getApplicableCampaigns(eventData) {
    const { market, channel, productLine, timestamp } = eventData;
    const eventDate = new Date(timestamp);
    
    return this.campaigns.filter(campaign => {
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      
      return campaign.isActive &&
             startDate <= eventDate &&
             endDate >= eventDate &&
             (campaign.market === market || campaign.market === 'ALL') &&
             (campaign.channel === channel || campaign.channel === 'ALL') &&
             (campaign.productLine === productLine || campaign.productLine === 'ALL');
    });
  }
}

module.exports = CampaignService;
