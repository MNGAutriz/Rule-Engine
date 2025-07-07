const express = require('express');
const router = express.Router();

// Import route modules
const eventsRouter = require('./events');
const consumerRouter = require('./consumer');
const defaultsRouter = require('./defaults');
const campaignsRouter = require('./campaigns');
const rulesRouter = require('./rules');
const rulesManagementRouter = require('./rulesManagement');

// Mount routes
router.use('/events', eventsRouter);
router.use('/consumer', consumerRouter);
router.use('/defaults', defaultsRouter);
router.use('/campaigns', campaignsRouter);
router.use('/rules', rulesRouter);
router.use('/rules-management', rulesManagementRouter);

module.exports = router;
