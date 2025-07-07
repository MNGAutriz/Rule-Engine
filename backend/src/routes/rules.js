const express = require('express');
const router = express.Router();
const { RulesController } = require('../controllers');

/**
 * GET /api/rules/active
 * Returns all active rules from the rule definition files
 */
router.get('/active', RulesController.getActiveRules);

/**
 * GET /api/rules/statistics
 * Get rule statistics and analytics
 */
router.get('/statistics', RulesController.getRuleStatistics);

/**
 * POST /api/rules/validate
 * Validate a rule definition
 */
router.post('/validate', RulesController.validateRule);

module.exports = router;
