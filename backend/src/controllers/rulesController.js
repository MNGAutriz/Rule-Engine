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

class RulesManagementController {
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
   * Get all rules with category information
   */
  async getAllRules(req, res, next) {
    try {
      logger.info('Fetching all rules for management');
      
      const allRules = [];
      
      for (const [category, fileName] of Object.entries(this.CATEGORY_FILES)) {
        const filePath = path.join(__dirname, '../../rules', fileName);
        try {
          const fileContent = await fs.readFile(filePath, 'utf8');
          const rules = JSON.parse(fileContent);
          
          // Add category and ID to each rule
          const rulesWithMetadata = rules.map((rule, index) => ({
            ...rule,
            id: `${category}_${index}`,
            category,
            fileName
          }));
          
          allRules.push(...rulesWithMetadata);
        } catch (error) {
          logger.warn(`Error reading ${fileName}`, error);
        }
      }
      
      res.json({
        success: true,
        rules: allRules,
        totalRules: allRules.length
      });
    } catch (error) {
      logger.error('Error fetching rules for management', error);
      next(error);
    }
  }

  /**
   * Process and validate rule data
   */
  processRuleData(rule) {
    // Ensure basic structure exists
    const processedRule = {
      name: rule.name || '',
      priority: typeof rule.priority === 'number' ? rule.priority : 1,
      active: rule.active !== false,
      conditions: rule.conditions || { all: [] },
      event: rule.event || { type: '', params: {} },
      markets: Array.isArray(rule.markets) ? rule.markets : [],
      channels: Array.isArray(rule.channels) ? rule.channels : []
    };

    // Process event parameters
    if (processedRule.event && processedRule.event.params) {
      const params = processedRule.event.params;
      
      // Clean up undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      // Ensure numeric values are properly typed
      if (params.multiplier && typeof params.multiplier === 'string') {
        params.multiplier = parseFloat(params.multiplier);
      }
      if (params.bonus && typeof params.bonus === 'string') {
        params.bonus = parseInt(params.bonus);
      }
      if (params.fixedBonus && typeof params.fixedBonus === 'string') {
        params.fixedBonus = parseInt(params.fixedBonus);
      }
      if (params.registrationBonus && typeof params.registrationBonus === 'string') {
        params.registrationBonus = parseInt(params.registrationBonus);
      }
      if (params.conversionRate && typeof params.conversionRate === 'string') {
        params.conversionRate = parseFloat(params.conversionRate);
      }
    }

    logger.info('Processed rule data', { processedRule });
    return processedRule;
  }

  /**
   * Add a new rule to a specific category
   */
  async addRule(req, res, next) {
    try {
      const { category, rule } = req.body;
      
      if (!category || !this.CATEGORY_FILES[category]) {
        return res.status(400).json({
          error: 'Invalid category',
          details: `Category must be one of: ${Object.keys(this.CATEGORY_FILES).join(', ')}`
        });
      }
      
      if (!rule) {
        return res.status(400).json({
          error: 'Missing rule data',
          details: 'rule object is required'
        });
      }
      
      logger.info('Adding new rule', { category, ruleName: rule.name });
      
      const fileName = this.CATEGORY_FILES[category];
      const filePath = path.join(__dirname, '../../rules', fileName);
      
      // Read current rules
      const fileContent = await fs.readFile(filePath, 'utf8');
      const currentRules = JSON.parse(fileContent);
      
      // Process and add new rule
      const processedRule = this.processRuleData(rule);
      currentRules.push(processedRule);
      
      // Write back to file
      await fs.writeFile(filePath, JSON.stringify(currentRules, null, 2));
      
      // Reload rules engine
      this.rulesEngine = new RulesEngine();
      
      res.status(201).json({
        success: true,
        message: 'Rule added successfully',
        ruleId: `${category}_${currentRules.length - 1}`,
        totalRules: currentRules.length
      });
    } catch (error) {
      logger.error('Error adding rule', error);
      next(error);
    }
  }

  /**
   * Update an existing rule
   */
  async updateRule(req, res, next) {
    try {
      const { ruleId } = req.params;
      const { rule } = req.body;
      
      if (!ruleId || !rule) {
        return res.status(400).json({
          error: 'Missing required parameters',
          details: 'ruleId and rule object are required'
        });
      }
      
      // Parse rule ID to get category and index
      const [category, indexStr] = ruleId.split('_');
      const index = parseInt(indexStr);
      
      if (!this.CATEGORY_FILES[category] || isNaN(index)) {
        return res.status(400).json({
          error: 'Invalid rule ID',
          details: 'Rule ID format should be category_index'
        });
      }
      
      logger.info('Updating rule', { ruleId, category, index });
      
      const fileName = this.CATEGORY_FILES[category];
      const filePath = path.join(__dirname, '../../rules', fileName);
      
      // Read current rules
      const fileContent = await fs.readFile(filePath, 'utf8');
      const currentRules = JSON.parse(fileContent);
      
      if (index >= currentRules.length) {
        return res.status(404).json({
          error: 'Rule not found',
          details: `Rule at index ${index} does not exist`
        });
      }
      
      // Process and update rule
      const processedRule = this.processRuleData(rule);
      currentRules[index] = processedRule;
      
      // Write back to file
      await fs.writeFile(filePath, JSON.stringify(currentRules, null, 2));
      
      // Reload rules engine
      this.rulesEngine = new RulesEngine();
      
      res.json({
        success: true,
        message: 'Rule updated successfully',
        ruleId,
        updatedRule: rule
      });
    } catch (error) {
      logger.error('Error updating rule', error);
      next(error);
    }
  }

  /**
   * Delete a rule
   */
  async deleteRule(req, res, next) {
    try {
      const { ruleId } = req.params;
      
      if (!ruleId) {
        return res.status(400).json({
          error: 'Missing required parameter',
          details: 'ruleId is required'
        });
      }
      
      // Parse rule ID to get category and index
      const [category, indexStr] = ruleId.split('_');
      const index = parseInt(indexStr);
      
      if (!this.CATEGORY_FILES[category] || isNaN(index)) {
        return res.status(400).json({
          error: 'Invalid rule ID',
          details: 'Rule ID format should be category_index'
        });
      }
      
      logger.info('Deleting rule', { ruleId, category, index });
      
      const fileName = this.CATEGORY_FILES[category];
      const filePath = path.join(__dirname, '../../rules', fileName);
      
      // Read current rules
      const fileContent = await fs.readFile(filePath, 'utf8');
      const currentRules = JSON.parse(fileContent);
      
      if (index >= currentRules.length) {
        return res.status(404).json({
          error: 'Rule not found',
          details: `Rule at index ${index} does not exist`
        });
      }
      
      // Remove rule
      const deletedRule = currentRules.splice(index, 1)[0];
      
      // Write back to file
      await fs.writeFile(filePath, JSON.stringify(currentRules, null, 2));
      
      // Reload rules engine
      this.rulesEngine = new RulesEngine();
      
      res.json({
        success: true,
        message: 'Rule deleted successfully',
        deletedRule,
        remainingRules: currentRules.length
      });
    } catch (error) {
      logger.error('Error deleting rule', error);
      next(error);
    }
  }

}

// Create instances to maintain context
const rulesController = new RulesController();
const rulesManagementController = new RulesManagementController();

// Export RulesController methods
const RulesControllerExports = {
  getActiveRules: rulesController.getActiveRules.bind(rulesController),
  getRuleStatistics: rulesController.getRuleStatistics.bind(rulesController),
  validateRule: rulesController.validateRule.bind(rulesController)
};

// Export RulesManagementController methods
const RulesManagementControllerExports = {
  getAllRules: rulesManagementController.getAllRules.bind(rulesManagementController),
  addRule: rulesManagementController.addRule.bind(rulesManagementController),
  updateRule: rulesManagementController.updateRule.bind(rulesManagementController),
  deleteRule: rulesManagementController.deleteRule.bind(rulesManagementController)
};

module.exports = RulesControllerExports;
