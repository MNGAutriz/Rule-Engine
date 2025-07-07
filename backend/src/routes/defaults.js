const express = require('express');
const router = express.Router();
const { DefaultsController } = require('../controllers');

/**
 * GET /api/defaults
 * Get default configuration values for the frontend form
 */
router.get('/', DefaultsController.getDefaults);

module.exports = router;
