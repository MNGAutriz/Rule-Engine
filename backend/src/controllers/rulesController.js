const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class RulesController {
  /**
   * Get all active rules from the rule definition files
   */
  static async getActiveRules(req, res, next) {
    try {
      const { startDate, endDate, market, channel, brand } = req.query;
      
      logger.info('Fetching active rules', { market, channel, brand });
      
      // Load all rule files
      const rulesDir = path.join(__dirname, '../../rules');
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
                    startDate: params.startDate,
                    endDate: params.endDate
                  };
                }
              }
              
              // Apply filters if provided
              let includeRule = true;
              
              if (market && rule.conditions) {
                const hasMarketCondition = rule.conditions.some(cond => 
                  cond.fact === 'market' && cond.value === market
                );
                if (!hasMarketCondition) includeRule = false;
              }
              
              if (channel && rule.conditions) {
                const hasChannelCondition = rule.conditions.some(cond => 
                  cond.fact === 'channel' && cond.value === channel
                );
                if (!hasChannelCondition) includeRule = false;
              }
              
              if (includeRule) {
                allRules.push({
                  ruleId: rule.name || `${ruleCategory}_${Date.now()}`,
                  category: ruleCategory,
                  priority: rule.priority || 1,
                  conditions: rule.conditions,
                  event: rule.event,
                  campaign: campaignInfo,
                  filename: filename
                });
              }
            });
          }
        }
      }
      
      // Sort by priority (higher priority first)
      allRules.sort((a, b) => (b.priority || 1) - (a.priority || 1));
      
      res.json({
        rules: allRules,
        totalRules: allRules.length,
        appliedFilters: { startDate, endDate, market, channel, brand }
      });
    } catch (error) {
      logger.error('Error fetching active rules', error);
      next(error);
    }
  }

  /**
   * Get rule statistics and analytics
   */
  static async getRuleStatistics(req, res, next) {
    try {
      logger.info('Fetching rule statistics');
      
      const rulesDir = path.join(__dirname, '../../rules');
      const ruleFiles = [
        'transaction-rules.json',
        'basket-threshold-rules.json',
        'consumer-attribute-rules.json',
        'product-multiplier-rules.json'
      ];
      
      let stats = {
        totalRules: 0,
        rulesByCategory: {},
        rulesByMarket: {},
        rulesByChannel: {}
      };
      
      for (const filename of ruleFiles) {
        const filePath = path.join(rulesDir, filename);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const rulesData = JSON.parse(fileContent);
          const category = filename.replace('-rules.json', '');
          
          if (rulesData.rules && Array.isArray(rulesData.rules)) {
            const categoryCount = rulesData.rules.length;
            stats.totalRules += categoryCount;
            stats.rulesByCategory[category] = categoryCount;
            
            // Analyze rules for market and channel distribution
            rulesData.rules.forEach(rule => {
              if (rule.conditions) {
                rule.conditions.forEach(condition => {
                  if (condition.fact === 'market') {
                    stats.rulesByMarket[condition.value] = (stats.rulesByMarket[condition.value] || 0) + 1;
                  }
                  if (condition.fact === 'channel') {
                    stats.rulesByChannel[condition.value] = (stats.rulesByChannel[condition.value] || 0) + 1;
                  }
                });
              }
            });
          }
        }
      }
      
      res.json({
        statistics: stats,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching rule statistics', error);
      next(error);
    }
  }

  /**
   * Validate a rule definition
   */
  static async validateRule(req, res, next) {
    try {
      const { rule } = req.body;
      
      if (!rule) {
        return res.status(400).json({
          error: 'Missing required parameter',
          details: 'rule object is required'
        });
      }
      
      logger.info('Validating rule definition', { ruleName: rule.name });
      
      // Basic rule structure validation
      const validationErrors = [];
      
      if (!rule.conditions || !Array.isArray(rule.conditions)) {
        validationErrors.push('Rule must have conditions array');
      }
      
      if (!rule.event || !rule.event.type) {
        validationErrors.push('Rule must have event with type');
      }
      
      // Validate condition structure
      if (rule.conditions) {
        rule.conditions.forEach((condition, index) => {
          if (!condition.fact) {
            validationErrors.push(`Condition ${index}: missing fact`);
          }
          if (!condition.operator) {
            validationErrors.push(`Condition ${index}: missing operator`);
          }
          if (condition.value === undefined) {
            validationErrors.push(`Condition ${index}: missing value`);
          }
        });
      }
      
      const isValid = validationErrors.length === 0;
      
      res.json({
        valid: isValid,
        errors: validationErrors,
        message: isValid ? 'Rule is valid' : 'Rule has validation errors'
      });
    } catch (error) {
      logger.error('Error validating rule', error);
      next(error);
    }
  }
}

module.exports = RulesController;
