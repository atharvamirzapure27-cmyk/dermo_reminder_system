const notificationRepository = require('../repositories/notificationRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const settingsRepository = require('../repositories/settingsRepository');
const notificationManager = require('../services/notificationManager');
const auditService = require('../services/auditService');
const { get1DayReminderMessage } = require('../services/reminderMessageService');
const { getSchedulerState } = require('../cron/reminderCron');

/**
 * Retrieve paginated notification logs history
 */
exports.getNotificationsHistory = async (req, res, next) => {
  try {
    const result = await notificationRepository.findLogsHistory(req.query);

    res.json({
      success: true,
      data: result.rows,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually retry failed alert dispatches
 */
exports.retryFailedNotification = async (req, res, next) => {
  try {
    const logId = Number(req.params.id);
    if (!logId || isNaN(logId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification log ID' });
    }

    const result = await notificationManager.retryFailedNotification(logId);
    
    await auditService.log(
      req, 
      'notification_retry_triggered', 
      `Triggered manual retry for notification log ID=${logId}. Succeeded: ${result.success}`
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Notification resent successfully',
        sid: result.sid
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Resend retry failed',
        error: result.error
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Manually dispatch test notification sweep across all channels
 */
exports.triggerNotificationTest = async (req, res, next) => {
  try {
    const appointmentId = Number(req.body.appointment_id);
    if (!appointmentId || isNaN(appointmentId)) {
      return res.status(400).json({ success: false, message: 'appointment_id is required' });
    }

    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment record not found' });
    }

    console.log(`[Admin] Triggering E2E test notifications for appointment ID=${appointmentId}...`);

    const text = get1DayReminderMessage(appointment);
    const results = await notificationManager.sendAlertsAcrossChannels({
      appointment,
      messageType: '1day_reminder',
      messageText: text
    });

    await auditService.log(
      req,
      'test_notifications_triggered',
      `Manually triggered test dispatches for appointment ID=${appointmentId}`
    );

    res.json({
      success: true,
      message: 'Test notifications dispatched successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current scheduler monitoring status & statistics
 */
exports.getSchedulerStatus = async (req, res, next) => {
  try {
    const memoryState = getSchedulerState();
    const todayStats = await notificationRepository.getTodayNotificationStats();
    const pendingReminders = await appointmentRepository.getPendingRemindersCount();
    const channelSettings = await settingsRepository.getSettings();

    let nextRun = null;
    if (memoryState.lastRun) {
      const last = new Date(memoryState.lastRun).getTime();
      nextRun = new Date(last + 30 * 60 * 1000).toISOString();
    } else {
      nextRun = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }

    res.json({
      success: true,
      data: {
        status: memoryState.status || 'running',
        cronSchedule: memoryState.cronSchedule || '*/30 * * * *',
        lastRun: memoryState.lastRun,
        nextRun,
        lastDurationMs: memoryState.lastDurationMs || 0,
        lastError: memoryState.lastError,
        processedToday: todayStats.processedToday,
        sentToday: todayStats.sentToday,
        failedToday: todayStats.failedToday,
        pendingReminders,
        channels: {
          sms: Boolean(channelSettings.sms_enabled),
          whatsapp: Boolean(channelSettings.whatsapp_enabled),
          voice: Boolean(channelSettings.voice_enabled)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
