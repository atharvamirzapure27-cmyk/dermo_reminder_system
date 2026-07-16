const reportRepository = require('../repositories/reportRepository');
const exportService = require('./exportService');

const REPORT_TYPES = ['daily', 'weekly', 'monthly', 'missed', 'reminders'];
const FORMATS = ['json', 'csv', 'excel', 'pdf'];

const getReport = async (type = 'daily') => {
  const normalizedType = REPORT_TYPES.includes(type) ? type : 'daily';
  const rows = await reportRepository.getReportRows(normalizedType);

  return {
    type: normalizedType,
    count: rows.length,
    data: rows
  };
};

const exportReport = async (type = 'daily', format = 'csv') => {
  const normalizedFormat = FORMATS.includes(format) ? format : 'csv';
  const report = await getReport(type);

  if (normalizedFormat === 'pdf') {
    return {
      contentType: 'application/pdf',
      extension: 'pdf',
      body: exportService.toPdf(report.data)
    };
  }

  if (normalizedFormat === 'excel') {
    return {
      contentType: 'application/vnd.ms-excel',
      extension: 'xls',
      body: exportService.toExcel(report.data)
    };
  }

  return {
    contentType: 'text/csv',
    extension: 'csv',
    body: exportService.toCsv(report.data)
  };
};

module.exports = {
  getReport,
  exportReport,
  REPORT_TYPES
};
