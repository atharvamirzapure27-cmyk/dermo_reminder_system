const auditRepository = require('../repositories/auditRepository');

const log = async (req, action, details) => {
  try {
    const userId = req.user ? req.user.id : null;
    const username = req.user ? req.user.username : (req.body && req.body.username ? req.body.username : 'system');
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await auditRepository.logAction({
      userId,
      username,
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      ipAddress
    });
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
};

const getRecentLogs = async (limit = 100) => {
  return auditRepository.findRecent(limit);
};

module.exports = {
  log,
  getRecentLogs
};
