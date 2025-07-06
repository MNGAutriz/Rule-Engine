const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

/**
 * GET /api/rules/active
 * Returns all active rules from the rule definition files
 * Optional query parameters:
 * - startDate: filter rules active from this date
 * - endDate: filter rules active until this date
 * - market: filter by market
 * - channel: filter by channel
 * - brand: filter by brand
 */
router.get('/active', async (req, res) => {
  try {
    const { startDate, endDate, market, channel, brand } = req.query;
    
    // Load all rule files
    const rulesDir = path.join(__dirname, '../rules');
    const ruleFiles = [
      'transaction-rules.json',
      'basket-threshold-rules.json',
      'consumer-attribute-rules.json',
      'product-multiplier-rules.json'
    ];
    
    let allRules = [];
    
    // Load rules from each file
    for (const filename of ruleFiles) {
      const filePath = path.join(rulesDir, filename);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const rulesData = JSON.parse(fileContent);
        
        // Extract category from filename
        const ruleCategory = filename.replace('-rules.json', '');
        
        // Add rules with metadata
        if (rulesData.rules && Array.isArray(rulesData.rules)) {
          rulesData.rules.forEach(rule => {
            // Check if rule has campaign information
            let campaignInfo = null;
            if (rule.event && rule.event.params) {
              const params = rule.event.params;
              if (params.campaignId && params.campaignCode) {
                campaignInfo = {
                  campaignId: params.campaignId,
                  campaignCode: params.campaignCode,
                  startDate: params.campaignStart,
                  endDate: params.campaignEnd,
                  description: params.description
                };
              } else if (rule.conditions && rule.conditions.all) {
                // Extract date conditions for non-campaign rules
                const dateConditions = rule.conditions.all.filter(cond => 
                  cond.fact === 'eventDate'
                );
                
                if (dateConditions.length >= 2) {
                  const startCond = dateConditions.find(c => c.operator === 'greaterThanInclusive');
                  const endCond = dateConditions.find(c => c.operator === 'lessThanInclusive');
                  
                  if (startCond && endCond) {
                    campaignInfo = {
                      campaignId: rule.name.replace(/\s+/g, '-').toLowerCase(),
                      campaignCode: rule.name.replace(/\s+/g, '_').toUpperCase(),
                      startDate: startCond.value + 'T00:00:00Z',
                      endDate: endCond.value + 'T23:59:59Z',
                      description: rule.event?.params?.description || rule.name
                    };
                  }
                }
              }
            }
            
            // Apply date filtering for campaign rules
            let isActiveInDateRange = true;
            if (campaignInfo && (startDate || endDate)) {
              const ruleStart = new Date(campaignInfo.startDate);
              const ruleEnd = new Date(campaignInfo.endDate);
              const filterStart = startDate ? new Date(startDate) : new Date('1900-01-01');
              const filterEnd = endDate ? new Date(endDate) : new Date('2100-12-31');
              
              // Rule is active if there's overlap between rule dates and filter dates
              isActiveInDateRange = (ruleStart <= filterEnd && ruleEnd >= filterStart);
            }
            
            if (isActiveInDateRange) {
              allRules.push({
                campaignCode: rule.name.replace(/\s+/g, '_').toUpperCase(),
                ruleId: rule.name,
                name: rule.name,
                category: ruleCategory,
                priority: rule.priority || 100,
                active: true,
                description: rule.event?.params?.description || 'No description available',
                conditions: rule.conditions,
                event: rule.event,
                market: market || "ALL",
                channel: channel || "ALL", 
                brand: brand || "ALL",
                startDate: campaignInfo?.startDate || null,
                endDate: campaignInfo?.endDate || null,
                source: filename
              });
            }
          });
        }
      }
    }
    
    // Format response to match the expected campaign structure
    const campaigns = [];
    const rules = [];
    
    allRules.forEach(rule => {
      // Check if this is a campaign rule (has date range)
      if (rule.startDate && rule.endDate) {
        campaigns.push({
          campaignCode: rule.campaignCode,
          campaignId: rule.campaignCode.toLowerCase().replace(/_/g, '-'),
          name: rule.name,
          market: rule.market,
          channel: rule.channel,
          brand: rule.brand,
          startDate: rule.startDate,
          endDate: rule.endDate,
          ruleIds: [rule.ruleId],
          active: rule.active,
          priority: rule.priority,
          description: rule.description
        });
      } else {
        rules.push({
          ruleId: rule.ruleId,
          campaignCode: rule.campaignCode,
          name: rule.name,
          market: rule.market,
          channel: rule.channel,
          brand: rule.brand,
          active: rule.active,
          priority: rule.priority,
          description: rule.description,
          category: rule.category
        });
      }
    });

    const response = {
      rules,
      campaigns,
      totalRules: rules.length,
      totalCampaigns: campaigns.length,
      filters: {
        market: market || null,
        channel: channel || null,
        brand: brand || null,
        startDate: startDate || null,
        endDate: endDate || null
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching active rules:', error);
    res.status(500).json({
      error: 'Failed to fetch active rules',
      message: error.message
    });
  }
});

/**
 * GET /api/campaigns/active
 * Returns active campaigns with optional date filtering
 * This is the endpoint mentioned in the requirements
 */
router.get('/campaigns/active', async (req, res) => {
  try {
    const { startDate, endDate, market, channel, brand } = req.query;
    
    // Load all rule files to find campaigns
    const rulesDir = path.join(__dirname, '../rules');
    const ruleFiles = [
      'transaction-rules.json',
      'basket-threshold-rules.json',
      'consumer-attribute-rules.json',
      'product-multiplier-rules.json'
    ];
    
    let campaigns = [];
    
    // Load rules from each file and extract campaigns
    for (const filename of ruleFiles) {
      const filePath = path.join(rulesDir, filename);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const rulesData = JSON.parse(fileContent);
        
        if (rulesData && Array.isArray(rulesData)) {
          rulesData.forEach(rule => {
            // Check if this rule has campaign information
            if (rule.event && rule.event.params) {
              const params = rule.event.params;
              if (params.campaignId && params.campaignCode) {
                const campaign = {
                  campaignCode: params.campaignCode,
                  campaignId: params.campaignId,
                  name: params.description || rule.name,
                  market: getMarketFromRule(rule) || market || "HK",
                  channel: getChannelFromRule(rule) || channel || "LINE",
                  brand: brand || "SK-II",
                  startDate: params.campaignStart,
                  endDate: params.campaignEnd,
                  ruleIds: [rule.event.type],
                  active: isCampaignActive(params.campaignStart, params.campaignEnd),
                  priority: rule.priority || 5,
                  description: params.description || rule.name
                };
                
                // Apply date filtering
                if (isInDateRange(campaign, startDate, endDate)) {
                  campaigns.push(campaign);
                }
              }
            }
          });
        }
      }
    }
    
    // Remove duplicates and sort by priority
    campaigns = campaigns.filter((campaign, index, self) => 
      index === self.findIndex(c => c.campaignCode === campaign.campaignCode)
    ).sort((a, b) => a.priority - b.priority);
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    res.status(500).json({
      error: 'Failed to fetch active campaigns',
      message: error.message
    });
  }
});

// Helper functions
function getMarketFromRule(rule) {
  if (rule.conditions && rule.conditions.all) {
    const marketCondition = rule.conditions.all.find(cond => cond.fact === 'market');
    return marketCondition ? marketCondition.value : null;
  }
  return null;
}

function getChannelFromRule(rule) {
  if (rule.conditions && rule.conditions.all) {
    const channelCondition = rule.conditions.all.find(cond => cond.fact === 'channel');
    return channelCondition ? channelCondition.value : null;
  }
  return null;
}

function isCampaignActive(startDate, endDate) {
  if (!startDate || !endDate) return true;
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return now >= start && now <= end;
}

function isInDateRange(campaign, filterStartDate, filterEndDate) {
  if (!filterStartDate && !filterEndDate) return true;
  if (!campaign.startDate || !campaign.endDate) return true;
  
  const campaignStart = new Date(campaign.startDate);
  const campaignEnd = new Date(campaign.endDate);
  const filterStart = filterStartDate ? new Date(filterStartDate) : new Date('1900-01-01');
  const filterEnd = filterEndDate ? new Date(filterEndDate) : new Date('2100-12-31');
  
  // Campaign is in range if there's overlap
  return campaignStart <= filterEnd && campaignEnd >= filterStart;
}

/**
 * GET /api/rules/categories
 * Returns available rule categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      {
        category: 'transaction',
        description: 'Rules triggered by purchase transactions',
        filename: 'transaction-rules.json'
      },
      {
        category: 'basket-threshold',
        description: 'Rules based on basket value thresholds',
        filename: 'basket-threshold-rules.json'
      },
      {
        category: 'consumer-attribute',
        description: 'Rules based on consumer attributes and behavior',
        filename: 'consumer-attribute-rules.json'
      },
      {
        category: 'product-multiplier',
        description: 'Rules for product-specific point multipliers',
        filename: 'product-multiplier-rules.json'
      }
    ];
    
    res.json({
      totalCategories: categories.length,
      categories
    });
  } catch (error) {
    console.error('Error fetching rule categories:', error);
    res.status(500).json({
      error: 'Failed to fetch rule categories',
      message: error.message
    });
  }
});

module.exports = router;
