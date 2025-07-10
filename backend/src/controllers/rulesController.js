const fs = require('fs').promises;
const path = require('path');
const RulesEngine = require('../../engine/RulesEngine');
const logger = require('../utils/logger');

class RulesController {
  constructor() {
    this.rulesEngine = new RulesEngine();
    
    // Category to file mapping
    this.CATEGORY_FILES = {
      'transaction': 'transaction-rules.json',
      'consumer': 'consumer-attribute-rules.json',
      'product': 'product-multiplier-rules.json',
      'basket': 'basket-threshold-rules.json'
    };
  }

  /**
   * Get all active rules from the rule definition files
   */
  async getActiveRules(req, res, next) {
    try {
      logger.info('Fetching active rules');
      
      const allRules = [];
      
      for (const [category, fileName] of Object.entries(this.CATEGORY_FILES)) {
        const filePath = path.join(__dirname, '../../rules', fileName);
        try {
          const fileContent = await fs.readFile(filePath, 'utf8');
          const rules = JSON.parse(fileContent);
          
          // Filter only active rules and add category info
          const activeRules = rules
            .filter(rule => rule.active !== false)
            .map((rule, index) => ({
              ...rule,
              id: `${category}_${index}`,
              category
            }));
          
          allRules.push(...activeRules);
        } catch (error) {
          logger.warn(`Error reading ${fileName}`, error);
        }
      }
      
      res.json({
        success: true,
        rules: allRules,
        totalActiveRules: allRules.length
      });
    } catch (error) {
      logger.error('Error fetching active rules', error);
      next(error);
    }
  }

  /**
   * Get rule statistics and analytics
   */
  async getRuleStatistics(req, res, next) {
    try {
      logger.info('Generating rule statistics');
      
      const statistics = {
        totalRules: 0,
        activeRules: 0,
        inactiveRules: 0,
        rulesByCategory: {},
        rulesByPriority: {},
        eventTypes: new Set()
      };
      
      for (const [category, fileName] of Object.entries(this.CATEGORY_FILES)) {
        const filePath = path.join(__dirname, '../../rules', fileName);
        try {
          const fileContent = await fs.readFile(filePath, 'utf8');
          const rules = JSON.parse(fileContent);
          
          statistics.rulesByCategory[category] = {
            total: rules.length,
            active: rules.filter(rule => rule.active !== false).length,
            inactive: rules.filter(rule => rule.active === false).length
          };
          
          statistics.totalRules += rules.length;
          statistics.activeRules += statistics.rulesByCategory[category].active;
          statistics.inactiveRules += statistics.rulesByCategory[category].inactive;
          
          // Analyze rule priorities and event types
          rules.forEach(rule => {
            const priority = rule.priority || 1;
            statistics.rulesByPriority[priority] = (statistics.rulesByPriority[priority] || 0) + 1;
            
            if (rule.event && rule.event.type) {
              statistics.eventTypes.add(rule.event.type);
            }
          });
          
        } catch (error) {
          logger.warn(`Error reading ${fileName} for statistics`, error);
        }
      }
      
      // Convert Set to Array for JSON response
      statistics.eventTypes = Array.from(statistics.eventTypes);
      
      res.json({
        success: true,
        statistics
      });
    } catch (error) {
      logger.error('Error generating rule statistics', error);
      next(error);
    }
  }

  /**
   * Validate a rule definition
   */
  async validateRule(req, res, next) {
    try {
      const { rule } = req.body;
      
      if (!rule) {
        return res.status(400).json({
          success: false,
          error: 'Missing rule data',
          details: 'rule object is required'
        });
      }
      
      logger.info('Validating rule', { ruleName: rule.name });
      
      const validationResult = {
        valid: true,
        errors: [],
        warnings: []
      };
      
      // Basic validation checks
      if (!rule.name || typeof rule.name !== 'string') {
        validationResult.errors.push('Rule name is required and must be a string');
      }
      
      if (!rule.conditions || typeof rule.conditions !== 'object') {
        validationResult.errors.push('Rule conditions are required and must be an object');
      }
      
      if (!rule.event || typeof rule.event !== 'object') {
        validationResult.errors.push('Rule event is required and must be an object');
      } else {
        if (!rule.event.type) {
          validationResult.errors.push('Rule event type is required');
        }
      }
      
      // Priority validation
      if (rule.priority !== undefined && (typeof rule.priority !== 'number' || rule.priority < 1)) {
        validationResult.errors.push('Priority must be a number greater than 0');
      }
      
      // Markets validation
      if (rule.markets && !Array.isArray(rule.markets)) {
        validationResult.errors.push('Markets must be an array');
      }
      
      // Channels validation
      if (rule.channels && !Array.isArray(rule.channels)) {
        validationResult.errors.push('Channels must be an array');
      }
      
      // Conditions structure validation
      if (rule.conditions) {
        if (!rule.conditions.all && !rule.conditions.any) {
          validationResult.warnings.push('Rule conditions should have either "all" or "any" property');
        }
        
        if (rule.conditions.all && !Array.isArray(rule.conditions.all)) {
          validationResult.errors.push('Conditions.all must be an array');
        }
        
        if (rule.conditions.any && !Array.isArray(rule.conditions.any)) {
          validationResult.errors.push('Conditions.any must be an array');
        }
      }
      
      // Event parameters validation
      if (rule.event && rule.event.params) {
        const params = rule.event.params;
        
        // Check for numeric parameters
        ['multiplier', 'bonus', 'fixedBonus', 'registrationBonus', 'conversionRate'].forEach(param => {
          if (params[param] !== undefined && typeof params[param] !== 'number') {
            if (isNaN(parseFloat(params[param]))) {
              validationResult.errors.push(`Event parameter '${param}' must be a valid number`);
            } else {
              validationResult.warnings.push(`Event parameter '${param}' should be a number, not a string`);
            }
          }
        });
      }
      
      validationResult.valid = validationResult.errors.length === 0;
      
      res.json({
        success: true,
        validation: validationResult
      });
    } catch (error) {
      logger.error('Error validating rule', error);
      next(error);
    }
  }
}

// Create and export controller instance
const rulesController = new RulesController();

module.exports = {
  getActiveRules: rulesController.getActiveRules.bind(rulesController),
  getRuleStatistics: rulesController.getRuleStatistics.bind(rulesController),
  validateRule: rulesController.validateRule.bind(rulesController)
};
