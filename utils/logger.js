const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../logs');

// Ensure /logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Format timestamp for log entries
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Append message to a specific file
 */
const appendToLogFile = (filename, level, message, details = null) => {
  const filePath = path.join(LOGS_DIR, filename);
  const logMessage = `[${getTimestamp()}] [${level.toUpperCase()}] ${message} ${details ? JSON.stringify(details) : ''}\n`;

  // Asynchronously append to file to avoid blocking event loop
  fs.appendFile(filePath, logMessage, (err) => {
    if (err) {
      console.error(`[Logger] Failed to write to log file ${filename}:`, err.message);
    }
  });

  // Also print to stdout in development
  if (process.env.NODE_ENV !== 'production' || level === 'error') {
    if (level === 'error') {
      console.error(logMessage.trim());
    } else {
      console.log(logMessage.trim());
    }
  }
};

/**
 * Centralized Application Logger
 */
const logger = {
  info: (message, details = null) => {
    appendToLogFile('app.log', 'info', message, details);
  },

  error: (message, details = null) => {
    appendToLogFile('errors.log', 'error', message, details);
    appendToLogFile('app.log', 'error', message, details);
  },

  cron: (message, details = null) => {
    appendToLogFile('cron.log', 'cron', message, details);
    appendToLogFile('app.log', 'cron', message, details);
  },

  notification: (message, details = null) => {
    appendToLogFile('notifications.log', 'notification', message, details);
    appendToLogFile('app.log', 'notification', message, details);
  }
};

module.exports = logger;
