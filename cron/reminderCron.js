const cron = require('node-cron');
const { cronSchedule } = require('../config/appConfig');
const { sendReminders } = require('../services/reminderService');

const scheduleReminderJob = (log = console.log) => {
  cron.schedule(cronSchedule, () => {
    log(`\n[Scheduler] Running Reminder Job at ${new Date().toLocaleString()}...`);
    sendReminders();
  });

  log(`[Scheduler] SMS reminders scheduled to scan at interval: ${cronSchedule}`);
};

module.exports = {
  scheduleReminderJob,
  sendReminders
};
