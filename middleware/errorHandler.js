const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  logger.error(status === 500 ? 'Unhandled error' : 'Request error', {
    message: err.message,
    stack: err.stack,
    status
  });

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : err.message,
    error: err.message
  });
};

module.exports = errorHandler;
