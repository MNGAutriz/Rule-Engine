const fs = require('fs').promises;
const path = require('path');
const RulesEngine = require('../../engine/RulesEngine');
const logger = require('../utils/logger');

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

// Create instance to maintain context
const rulesManagementController = new RulesManagementController();

module.exports = {
  getAllRules: rulesManagementController.getAllRules.bind(rulesManagementController),
  addRule: rulesManagementController.addRule.bind(rulesManagementController),
  updateRule: rulesManagementController.updateRule.bind(rulesManagementController),
  deleteRule: rulesManagementController.deleteRule.bind(rulesManagementController)
};
