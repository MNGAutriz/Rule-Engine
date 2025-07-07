const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const { logger } = require('./src/utils');
const { errorHandler } = require('./src/middleware/errorHandler');
const apiRoutes = require('./src/routes');

const app = express();

// Middleware
app.use(cors(config.cors));

// JSON parsing with better error handling
app.use(express.json({
  limit: config.request.jsonLimit,
  strict: true
}));

// JSON parsing error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    logger.error('JSON parsing error', error);
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains malformed JSON. Please check your JSON syntax.'
    });
  }
  next(error);
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: config.app.version,
    name: config.app.name
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Endpoint not found', { method: req.method, path: req.path });
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(config.port, () => {
  logger.info(`${config.app.name} server running on port ${config.port}`, {
    port: config.port,
    environment: config.nodeEnv,
    version: config.app.version
  });
});

module.exports = app;
