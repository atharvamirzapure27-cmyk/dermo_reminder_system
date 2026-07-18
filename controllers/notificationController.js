const notificationRepository = require('../repositories/notificationRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const notificationManager = require('../services/notificationManager');
const auditService = require('../services/auditService');
const { get1DayReminderMessage } = require('../services/reminderMessageService');

/**
 * Retrieve paginated notification logs history
 */
exports.getNotificationsHistory = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 50);
    const page = Number(req.query.page || 1);
    const offset = (page - 1) * limit;

    const logs = await notificationRepository.findLogsHistory(limit, offset);
    const total = await notificationRepository.countAllLogs();

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
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
