const cron = require('node-cron');
const { cronSchedule } = require('../config/appConfig');
const { sendReminders } = require('../services/reminderService');

const schedulerState = {
  status: 'running',
  lastRun: null,
  lastDurationMs: 0,
  lastError: null,
  cronSchedule: cronSchedule || '*/30 * * * *'
};

const scheduleReminderJob = (log = console.log) => {
  cron.schedule(cronSchedule, async () => {
    const startTime = Date.now();
    schedulerState.lastRun = new Date().toISOString();
    log(`\n[Scheduler] Running Reminder Job at ${new Date().toLocaleString()}...`);
    try {
      const res = await sendReminders();
      schedulerState.lastDurationMs = Date.now() - startTime;
      if (res.status === 'error') {
        schedulerState.status = 'error';
        schedulerState.lastError = res.message;
      } else {
        schedulerState.status = 'running';
        schedulerState.lastError = null;
      }
    } catch (err) {
      schedulerState.lastDurationMs = Date.now() - startTime;
      schedulerState.status = 'error';
      schedulerState.lastError = err.message;
    }
  });

  log(`[Scheduler] SMS reminders scheduled to scan at interval: ${cronSchedule}`);
};

const getSchedulerState = () => ({ ...schedulerState });

module.exports = {
  scheduleReminderJob,
  sendReminders,
  getSchedulerState
};
