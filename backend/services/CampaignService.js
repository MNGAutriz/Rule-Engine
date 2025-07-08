const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

/**
 * Campaign Service - Manages campaign data and business logic
 * Follows the design template for campaign management
 */
class CampaignService {
  constructor() {
    this.campaignsFile = path.join(__dirname, '../data/campaigns.json');
    this.campaigns = [];
    this.loadCampaigns();
  }

  /**
   * Load campaigns from JSON file
   */
  loadCampaigns() {
    try {
      if (fs.existsSync(this.campaignsFile)) {
        const data = fs.readFileSync(this.campaignsFile, 'utf8');
        this.campaigns = JSON.parse(data);
      } else {
        // Initialize with default campaigns
        this.campaigns = this.getDefaultCampaigns();
        this.saveCampaigns();
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      this.campaigns = this.getDefaultCampaigns();
      this.saveCampaigns();
    }
  }

  /**
   * Save campaigns to JSON file
   */
  saveCampaigns() {
    try {
      const dir = path.dirname(this.campaignsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.campaignsFile, JSON.stringify(this.campaigns, null, 2));
    } catch (error) {
      console.error('Error saving campaigns:', error);
    }
  }

  /**
   * Get default campaigns
   */
  getDefaultCampaigns() {
    return [
      {
        campaignId: 'c0a1b2c3-d4e5-6789-hk01-abcde123456f',
        campaignCode: 'CAMP2025SUMMER',
        name: 'Summer Double Points',
        market: 'HK',
        channel: 'LINE',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-07-15T23:59:59Z',
        ruleIds: ['FLEXIBLE_CAMPAIGN_BONUS'],
        isActive: true,
        description: 'Summer campaign with fixed bonus points for purchases above HKD 500'
      },
      {
        campaignId: 'c1b2c3d4-e5f6-7890-jp02-bcdef234567g',
        campaignCode: 'CAMP2025BIRTHDAY',
        name: 'Birthday Month Special',
        market: 'JP',
        channel: 'ALL',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        ruleIds: ['FIRST_PURCHASE_BIRTH_MONTH_BONUS'],
        isActive: true,
        description: 'Birthday month bonus for first purchase - valid only during customer birth month'
      },
      {
        campaignId: 'c2c3d4e5-f6g7-8901-tw03-cdefg345678h',
        campaignCode: 'CAMP2025VIP',
        name: 'VIP Exclusive Multiplier',
        market: 'TW',
        channel: 'COUNTER',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
        ruleIds: ['FLEXIBLE_VIP_MULTIPLIER'],
        isActive: true,
        description: 'VIP customers get 2x points at VIP counters - valid only at designated VIP store locations'
      },
      {
        campaignId: 'c3d4e5f6-g7h8-9012-hk04-defgh456789i',
        campaignCode: 'CAMP2025COMBO',
        name: 'Product Combo Bonus',
        market: 'HK',
        channel: 'ALL',
        startDate: '2025-06-15T00:00:00Z',
        endDate: '2025-07-31T23:59:59Z',
        ruleIds: ['FLEXIBLE_COMBO_PRODUCT_MULTIPLIER'],
        isActive: true,
        description: 'Bonus points for purchasing product combinations - must purchase all items in combo set'
      }
    ];
  }

  /**
   * Determine campaign status based on dates
   */
  getCampaignStatus(campaign) {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Ended';
    return 'Active';
  }

  /**
   * Auto-update campaign active status based on dates
   */
  updateCampaignActiveStatus(campaign) {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    // Campaign is considered active only if current time is within start and end dates
    campaign.isActive = (startDate <= now && endDate >= now);
    return campaign;
  }

  /**
   * Get active campaigns with optional filters
   */
  async getActiveCampaigns(filters = {}) {
    // Update all campaigns' active status based on current date
    this.campaigns = this.campaigns.map(campaign => this.updateCampaignActiveStatus(campaign));
    this.saveCampaigns();

    let filteredCampaigns = [...this.campaigns];

    // Apply filters
    if (filters.market && filters.market !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.market === filters.market || c.market === 'ALL'
      );
    }
    
    if (filters.channel && filters.channel !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.channel === filters.channel || c.channel === 'ALL'
      );
    }
    
    // Improved date filtering - check for overlap
    if (filters.startDate || filters.endDate) {
      const filterStart = filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01');
      const filterEnd = filters.endDate ? new Date(filters.endDate) : new Date('2100-12-31');
      
      filteredCampaigns = filteredCampaigns.filter(campaign => {
        const campaignStart = new Date(campaign.startDate);
        const campaignEnd = new Date(campaign.endDate);
        
        // Campaign overlaps with filter range
        return campaignStart <= filterEnd && campaignEnd >= filterStart;
      });
    }

    // Format response to match expected structure
    return filteredCampaigns.map(campaign => ({
      campaignCode: campaign.campaignCode,
      campaignId: campaign.campaignId,
      name: campaign.name,
      market: campaign.market,
      channel: campaign.channel,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      ruleIds: campaign.ruleIds || [],
      isActive: campaign.isActive,
      description: campaign.description || '',
      status: this.getCampaignStatus(campaign)
    }));
  }

  /**
   * Get all campaigns
   */
  async getAllCampaigns() {
    // Update all campaigns' active status based on current date
    this.campaigns = this.campaigns.map(campaign => this.updateCampaignActiveStatus(campaign));
    this.saveCampaigns();

    return this.campaigns.map(campaign => ({
      campaignId: campaign.campaignId,
      campaignCode: campaign.campaignCode,
      name: campaign.name,
      market: campaign.market,
      channel: campaign.channel,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      ruleIds: campaign.ruleIds || [],
      isActive: campaign.isActive,
      description: campaign.description || '',
      status: this.getCampaignStatus(campaign)
    }));
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
    return this.campaigns.find(c => c.campaignCode === campaignCode);
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData) {
    // Validate required fields
    if (!campaignData.campaignCode || !campaignData.name) {
      throw new Error('Campaign code and name are required');
    }

    if (!campaignData.startDate || !campaignData.endDate) {
      throw new Error('Start date and end date are required');
    }

    // Validate dates
    const startDate = new Date(campaignData.startDate);
    const endDate = new Date(campaignData.endDate);
    
    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }

    // Check if campaign code already exists
    const existingCampaign = this.campaigns.find(c => c.campaignCode === campaignData.campaignCode);
    if (existingCampaign) {
      throw new Error('Campaign code already exists');
    }

    // Create new campaign
    const newCampaign = {
      campaignId: uuidv4(),
      campaignCode: campaignData.campaignCode,
      name: campaignData.name,
      market: campaignData.market || 'ALL',
      channel: campaignData.channel || 'ALL',
      startDate: campaignData.startDate,
      endDate: campaignData.endDate,
      ruleIds: campaignData.ruleIds || [],
      description: campaignData.description || ''
    };

    // Auto-determine active status based on dates
    this.updateCampaignActiveStatus(newCampaign);

    // Add to campaigns array
    this.campaigns.push(newCampaign);
    this.saveCampaigns();

    // Return campaign with status field
    return {
      ...newCampaign,
      status: this.getCampaignStatus(newCampaign)
    };
  }

  /**
   * Update an existing campaign
   */
  async updateCampaign(campaignCode, updateData) {
    const campaignIndex = this.campaigns.findIndex(c => c.campaignCode === campaignCode);
    if (campaignIndex === -1) {
      throw new Error('Campaign not found');
    }

    // Validate required fields
    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);
      
      if (startDate >= endDate) {
        throw new Error('End date must be after start date');
      }
    }

    // If campaignCode is being changed, check for duplicates
    if (updateData.campaignCode && updateData.campaignCode !== campaignCode) {
      const existingCampaign = this.campaigns.find(c => c.campaignCode === updateData.campaignCode);
      if (existingCampaign) {
        throw new Error('Campaign code already exists');
      }
    }

    // Update campaign
    this.campaigns[campaignIndex] = {
      ...this.campaigns[campaignIndex],
      ...updateData
    };

    // Auto-determine active status based on dates
    this.updateCampaignActiveStatus(this.campaigns[campaignIndex]);

    this.saveCampaigns();
    // Return campaign with status field
    return {
      ...this.campaigns[campaignIndex],
      status: this.getCampaignStatus(this.campaigns[campaignIndex])
    };
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignCode) {
    const campaignIndex = this.campaigns.findIndex(c => c.campaignCode === campaignCode);
    if (campaignIndex === -1) {
      throw new Error('Campaign not found');
    }

    const deletedCampaign = this.campaigns.splice(campaignIndex, 1)[0];
    this.saveCampaigns();

    return deletedCampaign;
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
    const { market, channel, timestamp } = eventData;
    const eventDate = new Date(timestamp);
    
    return this.campaigns.filter(campaign => {
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      
      return campaign.isActive &&
             startDate <= eventDate &&
             endDate >= eventDate &&
             (campaign.market === market || campaign.market === 'ALL') &&
             (campaign.channel === channel || campaign.channel === 'ALL');
    });
  }
}

module.exports = CampaignService;
