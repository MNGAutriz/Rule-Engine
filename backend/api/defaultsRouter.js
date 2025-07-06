const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * GET /api/defaults
 * Get default configuration values for the frontend form
 */
router.get('/', async (req, res) => {
  try {
    // Read actual users data to get real consumer IDs
    const usersPath = path.join(__dirname, '../data/users.json');
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    // Read events data to get real context values
    const eventsPath = path.join(__dirname, '../data/events.json');
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    
    // Extract real values from backend data
    const realConsumerIds = Object.keys(usersData);
    const realStoreIds = [...new Set(eventsData.map(e => e.context?.storeId).filter(Boolean))];
    const realCampaignCodes = [...new Set(eventsData.map(e => e.context?.campaignCode).filter(Boolean))];
    const realSkus = [...new Set(eventsData.flatMap(e => e.attributes?.skuList || []))];
    
    // Get market-specific data
    const getMarketDefaults = (market) => {
      const marketUsers = realConsumerIds.filter(id => id.includes(`_${market.toLowerCase()}_`));
      const marketEvents = eventsData.filter(e => e.market === market);
      const marketSkus = [...new Set(marketEvents.flatMap(e => e.attributes?.skuList || []))];
      
      return {
        consumerIds: marketUsers.slice(0, 5), // Limit to first 5 for dropdown
        storeIds: [...new Set(marketEvents.map(e => e.context?.storeId).filter(Boolean))],
        campaignCodes: [...new Set(marketEvents.map(e => e.context?.campaignCode).filter(Boolean))],
        skus: marketSkus.slice(0, 10), // Limit to first 10
        currency: market === 'HK' ? 'HKD' : market === 'JP' ? 'JPY' : 'TWD',
        defaultAmount: market === 'HK' ? 1500 : market === 'JP' ? 150000 : 45000
      };
    };
    
    const defaults = {
      markets: ['HK', 'JP', 'TW'],
      channels: ['ONLINE', 'STORE', 'MOBILE', 'ECOMMERCE'],
      eventTypes: ['PURCHASE', 'REGISTRATION', 'RECYCLE', 'CONSULTATION', 'ADJUSTMENT', 'REDEMPTION'],
      productLines: ['PREMIUM_SERIES', 'STANDARD_SERIES', 'BASIC_SERIES', 'ESSENCE_SERIES', 'LUXURY_SERIES'],
      currencies: [
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' }
      ],
      marketDefaults: {
        HK: getMarketDefaults('HK'),
        JP: getMarketDefaults('JP'),
        TW: getMarketDefaults('TW')
      },
      consultationTypes: [
        'BEAUTY_CONSULTATION',
        'PRODUCT_RECOMMENDATION', 
        'SKIN_ANALYSIS',
        'VIRTUAL_CONSULTATION'
      ],
      adjustmentReasons: [
        'CUSTOMER_SERVICE',
        'PROMOTION_CORRECTION',
        'SYSTEM_ERROR', 
        'MANAGER_OVERRIDE'
      ]
    };
    
    res.json(defaults);
  } catch (error) {
    console.error('Error getting defaults:', error);
    res.status(500).json({
      error: 'Failed to get defaults',
      message: error.message
    });
  }
});

module.exports = router;
