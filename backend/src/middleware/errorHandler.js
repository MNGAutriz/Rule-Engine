const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  logger.error(`API Error on ${req.method} ${req.path}`, error);

  // Handle specific error types
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains malformed JSON. Please check your JSON syntax.'
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      details: error.details || null
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
    message: statusCode >= 500 ? 'An unexpected error occurred' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info(`${req.method} ${req.path}`, {
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[level](`${req.method} ${req.path} - ${res.statusCode}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

/**
 * 404 handler middleware
 */
const notFoundHandler = (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

module.exports = {
  errorHandler,
  requestLogger,
  notFoundHandler
};
