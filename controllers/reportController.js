const reportService = require('../services/reportService');
const auditService = require('../services/auditService');

exports.getReport = async (req, res, next) => {
  try {
    const type = ['daily', 'weekly', 'monthly', 'quarterly', 'missed', 'reminders'].includes(req.params.type) ? req.params.type : 'daily';
    const report = await reportService.getReport(type);
    
    await auditService.log(req, 'report_viewed', `Viewed ${type} report`);

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
    const type = ['daily', 'weekly', 'monthly', 'quarterly', 'missed', 'reminders'].includes(req.params.type) ? req.params.type : 'daily';
    const file = await reportService.exportReport(type, req.params.format, req.user);
    
    await auditService.log(req, 'report_exported', `Exported ${type} report in ${req.params.format} format`);

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.${file.extension}"`);
    res.send(file.body);
  } catch (error) {
    next(error);
  }
};
