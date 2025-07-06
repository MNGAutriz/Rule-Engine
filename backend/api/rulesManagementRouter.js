const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const RulesEngine = require('../engine/RulesEngine');

// Initialize rules engine
const rulesEngine = new RulesEngine();

// Category to file mapping
const CATEGORY_FILES = {
  'transaction': 'transaction-rules.json',
  'consumer': 'consumer-attribute-rules.json',
  'product': 'product-multiplier-rules.json',
  'basket': 'basket-threshold-rules.json'
};

// Get all rules with category information
router.get('/', async (req, res) => {
  try {
    const allRules = [];
    
    for (const [category, fileName] of Object.entries(CATEGORY_FILES)) {
      const filePath = path.join(__dirname, '../rules', fileName);
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
        console.error(`Error reading ${fileName}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      rules: allRules,
      totalRules: allRules.length
    });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rules',
      message: error.message
    });
  }
});

// Create a new rule
router.post('/', async (req, res) => {
  try {
    const { category } = req.query;
    const ruleData = req.body;
    
    if (!category || !CATEGORY_FILES[category]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        message: 'Category must be one of: transaction, consumer, product, basket'
      });
    }
    
    const fileName = CATEGORY_FILES[category];
    const filePath = path.join(__dirname, '../rules', fileName);
    
    // Read existing rules
    let existingRules = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      existingRules = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      console.log(`Creating new rules file: ${fileName}`);
    }
    
    // Add the new rule
    existingRules.push(ruleData);
    
    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(existingRules, null, 2));
    
    // Reload rules in engine
    await rulesEngine.reloadRules();
    
    res.json({
      success: true,
      message: 'Rule created successfully',
      rule: {
        ...ruleData,
        id: `${category}_${existingRules.length - 1}`,
        category,
        fileName
      }
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create rule',
      message: error.message
    });
  }
});

// Update an existing rule
router.put('/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    const ruleData = req.body;
    
    // Parse rule ID to get category and index
    const [category, indexStr] = ruleId.split('_');
    const index = parseInt(indexStr);
    
    if (!category || !CATEGORY_FILES[category] || isNaN(index)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rule ID format'
      });
    }
    
    const fileName = CATEGORY_FILES[category];
    const filePath = path.join(__dirname, '../rules', fileName);
    
    // Read existing rules
    const fileContent = await fs.readFile(filePath, 'utf8');
    const existingRules = JSON.parse(fileContent);
    
    if (index < 0 || index >= existingRules.length) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }
    
    // Update the rule
    existingRules[index] = ruleData;
    
    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(existingRules, null, 2));
    
    // Reload rules in engine
    await rulesEngine.reloadRules();
    
    res.json({
      success: true,
      message: 'Rule updated successfully',
      rule: {
        ...ruleData,
        id: ruleId,
        category,
        fileName
      }
    });
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rule',
      message: error.message
    });
  }
});

// Delete a rule
router.delete('/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    
    // Parse rule ID to get category and index
    const [category, indexStr] = ruleId.split('_');
    const index = parseInt(indexStr);
    
    if (!category || !CATEGORY_FILES[category] || isNaN(index)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rule ID format'
      });
    }
    
    const fileName = CATEGORY_FILES[category];
    const filePath = path.join(__dirname, '../rules', fileName);
    
    // Read existing rules
    const fileContent = await fs.readFile(filePath, 'utf8');
    const existingRules = JSON.parse(fileContent);
    
    if (index < 0 || index >= existingRules.length) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }
    
    // Remove the rule
    const deletedRule = existingRules.splice(index, 1)[0];
    
    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(existingRules, null, 2));
    
    // Reload rules in engine
    await rulesEngine.reloadRules();
    
    res.json({
      success: true,
      message: 'Rule deleted successfully',
      deletedRule
    });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rule',
      message: error.message
    });
  }
});

// Validate rule structure
router.post('/validate', (req, res) => {
  try {
    const rule = req.body;
    const errors = [];
    
    // Basic validation
    if (!rule.name) errors.push('Rule name is required');
    if (!rule.event || !rule.event.type) errors.push('Event type is required');
    if (typeof rule.priority !== 'number') errors.push('Priority must be a number');
    if (!rule.conditions) errors.push('Conditions are required');
    
    const isValid = errors.length === 0;
    
    res.json({
      success: true,
      isValid,
      errors
    });
  } catch (error) {
    console.error('Error validating rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate rule',
      message: error.message
    });
  }
});

// Reload rules from files
router.post('/reload', async (req, res) => {
  try {
    await rulesEngine.reloadRules();
    res.json({
      success: true,
      message: 'Rules reloaded successfully'
    });
  } catch (error) {
    console.error('Error reloading rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reload rules',
      message: error.message
    });
  }
});

// Get rules by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!CATEGORY_FILES[category]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }
    
    const fileName = CATEGORY_FILES[category];
    const filePath = path.join(__dirname, '../rules', fileName);
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    const rules = JSON.parse(fileContent);
    
    // Add metadata to each rule
    const rulesWithMetadata = rules.map((rule, index) => ({
      ...rule,
      id: `${category}_${index}`,
      category,
      fileName
    }));
    
    res.json({
      success: true,
      rules: rulesWithMetadata,
      category,
      totalRules: rulesWithMetadata.length
    });
  } catch (error) {
    console.error(`Error fetching rules for category ${req.params.category}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rules for category',
      message: error.message
    });
  }
});

module.exports = router;
