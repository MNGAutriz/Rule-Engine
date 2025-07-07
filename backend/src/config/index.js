// Try to load dotenv if available, but don't fail if it's not installed
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, using environment variables only
}

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Application configuration
  app: {
    name: process.env.APP_NAME || 'Loyalty Rules Engine',
    version: process.env.APP_VERSION || '1.0.0',
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  
  // Request configuration
  request: {
    jsonLimit: process.env.JSON_LIMIT || '10mb',
    timeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000
  },
  
  // Data paths
  paths: {
    data: process.env.DATA_PATH || './data',
    rules: process.env.RULES_PATH || './rules',
    logs: process.env.LOGS_PATH || './logs'
  },
  
  // Rules engine configuration
  rulesEngine: {
    enableDebugLogs: process.env.RULES_DEBUG === 'true',
    enablePerformanceLogs: process.env.RULES_PERFORMANCE === 'true'
  },
  
  // CDP Service configuration
  cdp: {
    enabled: process.env.CDP_ENABLED === 'true',
    endpoint: process.env.CDP_ENDPOINT,
    timeout: parseInt(process.env.CDP_TIMEOUT) || 5000
  },
  
  // Development helpers
  isDevelopment: () => config.nodeEnv === 'development',
  isProduction: () => config.nodeEnv === 'production',
  isTest: () => config.nodeEnv === 'test'
};

module.exports = config;
