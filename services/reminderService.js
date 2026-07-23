const appointmentRepository = require('../repositories/appointmentRepository');
const { 
  get3DayReminderMessage, 
  get1DayReminderMessage, 
  getMissedMessage, 
  getSameDayReminderMessage, 
  get7DayMissedReminderMessage 
} = require('./reminderMessageService');
const { sendAlertsAcrossChannels } = require('./notificationManager');
const logger = require('../utils/logger');

const getLocalDateOffset = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getReminderTargetDates = () => [
  getLocalDateOffset(-7),
  getLocalDateOffset(0),
  getLocalDateOffset(1),
  getLocalDateOffset(3)
];

const isTimeForSameDayReminders = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const timeInMinutes = currentHour * 60 + currentMinute;
  const startMinutes = 7 * 60 + 30; // 07:30 AM
  const endMinutes = 8 * 60;        // 08:00 AM

  return timeInMinutes >= startMinutes && timeInMinutes <= endMinutes;
};

const isTimeForStandardReminders = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const timeInMinutes = currentHour * 60 + currentMinute;
  const startMinutes = 9 * 60; // 09:00 AM
  const endMinutes = 18 * 60;  // 06:00 PM

  return timeInMinutes >= startMinutes && timeInMinutes <= endMinutes;
};

// Legacy compatibility
const isWithinWorkingHours = isTimeForStandardReminders;

const sendReminders = async (bypassWorkingHours = false) => {
  try {
    logger.cron('Initiating Reminder Scan sweeps...');

    const shouldRunSameDay = bypassWorkingHours || isTimeForSameDayReminders();
    const shouldRunStandard = bypassWorkingHours || isTimeForStandardReminders();

    if (!shouldRunSameDay && !shouldRunStandard) {
      logger.cron('Postponing dispatches: Outside active reminder windows.');
      return { status: 'postponed_outside_hours' };
    }

    // 1. Perform auto-transition of past appointments to missed status (standard working hours only)
    if (shouldRunStandard) {
      logger.cron('Executing missed status auto-transitions...');
      const transitionedRows = await appointmentRepository.autoTransitionMissedAppointments();
      if (transitionedRows > 0) {
        logger.cron(`Auto-transitioned ${transitionedRows} past appointments to 'missed' status.`);
      }
    }

    let stats = {
      sms: { success: 0, fail: 0, skipped: 0 },
      whatsapp_text: { success: 0, fail: 0, skipped: 0 },
      whatsapp_voice: { success: 0, fail: 0, skipped: 0 }
    };

    let r3Stats = { successCount: 0, failCount: 0 };
    let r1Stats = { successCount: 0, failCount: 0 };
    let rSameDayStats = { successCount: 0, failCount: 0 };
    let rmStats = { successCount: 0, failCount: 0 };
    let r7DayMissedStats = { successCount: 0, failCount: 0 };

    const updateStats = (results, categoryStats) => {
      for (const [ch, res] of Object.entries(results)) {
        if (res.status === 'skipped_duplicate') {
          stats[ch].skipped++;
        } else if (res.success) {
          stats[ch].success++;
          if (ch === 'sms' && categoryStats) {
            categoryStats.successCount++;
          }
        } else {
          stats[ch].fail++;
          if (ch === 'sms' && categoryStats) {
            categoryStats.failCount++;
          }
        }
      }
    };

    // 2. Process 3-Day Reminders (T + 3) (Standard Hours)
    if (shouldRunStandard) {
      const date3Day = getLocalDateOffset(3);
      const appointments3Day = await appointmentRepository.findPending3DayReminders(date3Day);
      if (appointments3Day.length > 0) {
        console.log(`[Scheduler] Processing ${appointments3Day.length} 3-day reminders...`);
        for (const appointment of appointments3Day) {
          const text = get3DayReminderMessage(appointment);
          const results = await sendAlertsAcrossChannels({
            appointment,
            messageType: '3day_reminder',
            messageText: text
          });
          updateStats(results, r3Stats);
        }
      }
    }

    // 3. Process 1-Day Reminders (T + 1) (Standard Hours)
    if (shouldRunStandard) {
      const date1Day = getLocalDateOffset(1);
      const appointments1Day = await appointmentRepository.findPending1DayReminders(date1Day);
      if (appointments1Day.length > 0) {
        console.log(`[Scheduler] Processing ${appointments1Day.length} 1-day reminders...`);
        for (const appointment of appointments1Day) {
          const text = get1DayReminderMessage(appointment);
          const results = await sendAlertsAcrossChannels({
            appointment,
            messageType: '1day_reminder',
            messageText: text
          });
          updateStats(results, r1Stats);
        }
      }
    }

    // 4. Process Same-Day Reminders (T + 0) (Same-Day Hours: 7:30 - 8:00 AM)
    if (shouldRunSameDay) {
      const dateToday = getLocalDateOffset(0);
      const appointmentsSameDay = await appointmentRepository.findPendingSameDayReminders(dateToday);
      if (appointmentsSameDay.length > 0) {
        console.log(`[Scheduler] Processing ${appointmentsSameDay.length} same-day reminders...`);
        for (const appointment of appointmentsSameDay) {
          const text = getSameDayReminderMessage(appointment);
          const results = await sendAlertsAcrossChannels({
            appointment,
            messageType: 'same_day_reminder',
            messageText: text
          });
          updateStats(results, rSameDayStats);
        }
      }
    }

    // 5. Process Next-Day Missed Reminders (Standard Hours)
    if (shouldRunStandard) {
      const appointmentsMissed = await appointmentRepository.findPendingMissedReminders();
      if (appointmentsMissed.length > 0) {
        console.log(`[Scheduler] Processing ${appointmentsMissed.length} missed reminders...`);
        for (const appointment of appointmentsMissed) {
          const text = getMissedMessage(appointment);
          const results = await sendAlertsAcrossChannels({
            appointment,
            messageType: 'missed_reminder',
            messageText: text
          });
          updateStats(results, rmStats);
        }
      }
    }

    // 6. Process 7-Day Missed Reminders (Standard Hours)
    if (shouldRunStandard) {
      const date7DaysAgo = getLocalDateOffset(-7);
      const appointments7DayMissed = await appointmentRepository.findPending7DayMissedReminders(date7DaysAgo);
      if (appointments7DayMissed.length > 0) {
        console.log(`[Scheduler] Processing ${appointments7DayMissed.length} 7-day missed reminders...`);
        for (const appointment of appointments7DayMissed) {
          const text = get7DayMissedReminderMessage(appointment);
          const results = await sendAlertsAcrossChannels({
            appointment,
            messageType: '7day_missed_reminder',
            messageText: text
          });
          updateStats(results, r7DayMissedStats);
        }
      }
    }

    logger.cron('Reminder Scan complete', { stats });

    return {
      status: 'success',
      stats,
      r3Day: r3Stats,
      r1Day: r1Stats,
      sameDay: rSameDayStats,
      missed: rmStats,
      missed7Day: r7DayMissedStats
    };

  } catch (error) {
    logger.error('Critical error in sendReminders', { message: error.message, stack: error.stack });
    return { status: 'error', message: error.message };
  }
};

module.exports = {
  sendReminders,
  isWithinWorkingHours,
  isTimeForSameDayReminders,
  isTimeForStandardReminders,
  getReminderTargetDates
};
