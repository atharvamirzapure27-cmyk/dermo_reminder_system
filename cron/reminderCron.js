const cron = require('node-cron');
const { cronSchedule } = require('../config/appConfig');
const { sendReminders } = require('../services/reminderService');

const scheduleReminderJob = (log = console.log) => {
  cron.schedule(cronSchedule, () => {
    log(`\nRunning Reminder Job at ${new Date().toLocaleString()}...`);
    sendReminders();
  });

  log(`SMS reminders scheduled: ${cronSchedule} (daily)`);
};

module.exports = {
  scheduleReminderJob,
  sendReminders
};
