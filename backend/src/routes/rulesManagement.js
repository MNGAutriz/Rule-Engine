const express = require('express');
const router = express.Router();
const { RulesManagementController } = require('../controllers');

/**
 * GET /api/rules-management
 * Get all rules with category information
 */
router.get('/', RulesManagementController.getAllRules);

/**
 * POST /api/rules-management
 * Add a new rule to a specific category
 */
router.post('/', RulesManagementController.addRule);

/**
 * PUT /api/rules-management/:ruleId
 * Update an existing rule
 */
router.put('/:ruleId', RulesManagementController.updateRule);

/**
 * DELETE /api/rules-management/:ruleId
 * Delete a rule
 */
router.delete('/:ruleId', RulesManagementController.deleteRule);

module.exports = router;
