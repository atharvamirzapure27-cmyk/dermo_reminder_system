const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  console.error(status === 500 ? 'Unhandled error:' : 'Request error:', err);

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : err.message,
    error: err.message
  });
};

module.exports = errorHandler;
