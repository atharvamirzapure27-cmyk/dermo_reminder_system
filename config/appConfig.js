require('dotenv').config();

module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 3001),
  cronSchedule: process.env.CRON_SCHEDULE || '0 9 * * *'
};
