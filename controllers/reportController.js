const reportService = require('../services/reportService');

exports.getReport = async (req, res, next) => {
  try {
    const report = await reportService.getReport(req.params.type);
    res.json({
      success: true,
      ...report
    });
  } catch (error) {
    next(error);
  }
};

exports.exportReport = async (req, res, next) => {
  try {
    const file = await reportService.exportReport(req.params.type, req.params.format);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.type || 'daily'}-report.${file.extension}"`);
    res.send(file.body);
  } catch (error) {
    next(error);
  }
};
