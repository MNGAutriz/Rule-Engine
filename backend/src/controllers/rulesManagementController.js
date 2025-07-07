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
      
      // Add new rule
      currentRules.push(rule);
      
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
      
      // Update rule
      currentRules[index] = rule;
      
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

  /**
   * Test a rule against sample data
   */
  async testRule(req, res, next) {
    try {
      const { rule, testData } = req.body;
      
      if (!rule || !testData) {
        return res.status(400).json({
          error: 'Missing required parameters',
          details: 'rule and testData objects are required'
        });
      }
      
      logger.info('Testing rule', { ruleName: rule.name });
      
      // Create a temporary rules engine with just this rule
      const { Engine } = require('json-rules-engine');
      const testEngine = new Engine();
      
      testEngine.addRule(rule);
      
      // Run the engine with test data
      const results = await testEngine.run(testData);
      
      res.json({
        success: true,
        testResults: {
          triggered: results.events.length > 0,
          events: results.events,
          facts: testData
        }
      });
    } catch (error) {
      logger.error('Error testing rule', error);
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
  deleteRule: rulesManagementController.deleteRule.bind(rulesManagementController),
  testRule: rulesManagementController.testRule.bind(rulesManagementController)
};
