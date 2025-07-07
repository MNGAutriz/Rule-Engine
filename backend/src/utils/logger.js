const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message, 
      ...(data && { data })
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logsDir, filename);
    fs.appendFileSync(filePath, content);
  }

  info(message, data = null) {
    const logMessage = this.formatMessage('INFO', message, data);
    console.log(`ℹ️  ${message}`, data || '');
    this.writeToFile('app.log', logMessage);
  }

  error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      ...(error.code && { code: error.code })
    } : null;
    
    const logMessage = this.formatMessage('ERROR', message, errorData);
    console.error(`❌ ${message}`, error || '');
    this.writeToFile('error.log', logMessage);
  }

  warn(message, data = null) {
    const logMessage = this.formatMessage('WARN', message, data);
    console.warn(`⚠️  ${message}`, data || '');
    this.writeToFile('app.log', logMessage);
  }

  debug(message, data = null) {
    // Only log debug in development
    if (process.env.NODE_ENV !== 'production') {
      const logMessage = this.formatMessage('DEBUG', message, data);
      console.log(`🐛 ${message}`, data || '');
      this.writeToFile('debug.log', logMessage);
    }
  }
}

module.exports = new Logger();
