const twilioService = require('./twilioService');
const whatsappService = require('./whatsappService');
const voiceService = require('./voiceService');
const notificationRepository = require('../repositories/notificationRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const settingsRepository = require('../repositories/settingsRepository');
const logger = require('../utils/logger');

/**
 * Coordinate alert dispatches across all three independent channels
 * @param {object} appointment - The joined patient and appointment db object
 * @param {string} messageType - '3day_reminder', '1day_reminder', or 'missed_reminder'
 * @param {string} messageText - Synthesized text body
 * @returns {Promise<object>} - Results statistics per channel
 */
const sendAlertsAcrossChannels = async ({ appointment, messageType, messageText }) => {
  const results = {};
  const channels = ['sms', 'whatsapp_text', 'whatsapp_voice'];
  const settings = await settingsRepository.getSettings();

  for (const channel of channels) {
    try {
      // 0. Channel enabled check from Admin settings
      if (channel === 'sms' && !settings.sms_enabled) {
        results[channel] = { status: 'disabled' };
        logger.info(`[Channel Disabled] SMS channel is disabled. Skipping appointment ${appointment.id}`);
        continue;
      }
      if (channel === 'whatsapp_text' && !settings.whatsapp_enabled) {
        results[channel] = { status: 'disabled' };
        logger.info(`[Channel Disabled] WhatsApp channel is disabled. Skipping appointment ${appointment.id}`);
        continue;
      }
      if (channel === 'whatsapp_voice' && !settings.voice_enabled) {
        results[channel] = { status: 'disabled' };
        logger.info(`[Channel Disabled] Voice Call channel is disabled. Skipping appointment ${appointment.id}`);
        continue;
      }

      // 1. Duplicate prevention check
      const alreadySent = await notificationRepository.checkAlreadySent(appointment.id, channel, messageType);
      if (alreadySent) {
        results[channel] = { status: 'skipped_duplicate' };
        logger.info(`[Duplicate Skip] ${channel} alert for appointment ${appointment.id} already sent`);
        continue;
      }

      logger.notification(`Dispatching ${channel} alert to ${appointment.patient_phone} for appointment ${appointment.id}`);

      let result;
      if (channel === 'sms') {
        result = await twilioService.sendSMS(appointment.patient_phone, messageText);
      } else if (channel === 'whatsapp_text') {
        result = await whatsappService.sendWhatsAppText(appointment.patient_phone, messageText);
      } else if (channel === 'whatsapp_voice') {
        result = await voiceService.sendVoiceMessage(appointment.patient_phone, messageText, appointment.language);
      }

      // 2. Write details to audit log
      await notificationRepository.logNotification({
        appointmentId: appointment.id,
        channel,
        recipientPhone: appointment.patient_phone,
        messageType,
        messageText,
        status: result.success ? 'sent' : 'failed',
        errorMessage: result.success ? null : result.error
      });

      // 3. Update appointment tracking fields
      await notificationRepository.updateAppointmentStatusFlags(appointment.id, channel, result.success, result.error);

      // 4. Update legacy columns on SMS success
      if (channel === 'sms' && result.success) {
        if (messageType === '3day_reminder') {
          await appointmentRepository.markReminder3DaySent(appointment.id);
        } else if (messageType === '1day_reminder') {
          await appointmentRepository.markReminderSent(appointment.id);
        } else if (messageType === 'same_day_reminder') {
          await appointmentRepository.markReminderSameDaySent(appointment.id);
        } else if (messageType === 'missed_reminder') {
          await appointmentRepository.markMissedSent(appointment.id);
        } else if (messageType === '7day_missed_reminder') {
          await appointmentRepository.markReminder7DayMissedSent(appointment.id);
        }
      }

      if (result.success) {
        logger.notification(`Success: ${channel} alert sent to ${appointment.patient_phone}. SID: ${result.sid}`);
      } else {
        logger.error(`Failed: ${channel} alert to ${appointment.patient_phone}. Error: ${result.error}`);
      }

      results[channel] = {
        success: result.success,
        sid: result.sid || null,
        error: result.error || null
      };

    } catch (channelErr) {
      console.error(`[NotificationManager] Cascade error in channel ${channel} for appointment ${appointment.id}:`, channelErr.message);
      results[channel] = {
        success: false,
        error: channelErr.message
      };
    }
  }

  return results;
};

/**
 * Handle manual admin retry of a failed notification log entry
 * @param {number} logId
 * @returns {Promise<object>} - { success: true/false, error }
 */
const retryFailedNotification = async (logId) => {
  const logEntry = await notificationRepository.findLogById(logId);
  if (!logEntry) {
    throw new Error('Notification log not found');
  }

  if (logEntry.status === 'sent' || logEntry.status === 'retried') {
    return { success: true, message: 'Notification already sent successfully.' };
  }

  console.log(`[NotificationManager] Retrying failed notification log ID: ${logId}...`);

  const settings = await settingsRepository.getSettings();
  if (logEntry.channel === 'sms' && !settings.sms_enabled) {
    return { success: false, error: 'SMS channel is currently disabled in Admin settings.' };
  }
  if (logEntry.channel === 'whatsapp_text' && !settings.whatsapp_enabled) {
    return { success: false, error: 'WhatsApp channel is currently disabled in Admin settings.' };
  }
  if (logEntry.channel === 'whatsapp_voice' && !settings.voice_enabled) {
    return { success: false, error: 'Voice Call channel is currently disabled in Admin settings.' };
  }

  let result;
  if (logEntry.channel === 'sms') {
    result = await twilioService.sendSMS(logEntry.recipient_phone, logEntry.message_text);
  } else if (logEntry.channel === 'whatsapp_text') {
    result = await whatsappService.sendWhatsAppText(logEntry.recipient_phone, logEntry.message_text);
  } else if (logEntry.channel === 'whatsapp_voice') {
    result = await voiceService.sendVoiceMessage(logEntry.recipient_phone, logEntry.message_text, logEntry.language);
  }

  if (result.success) {
    // Mark as retried
    await notificationRepository.updateLogStatus(logId, 'retried', null);
    // Update appointment status indicators
    await notificationRepository.updateAppointmentStatusFlags(logEntry.appointment_id, logEntry.channel, true, null);
    
    // Update legacy flags on SMS success
    if (logEntry.channel === 'sms') {
      if (logEntry.message_type === '3day_reminder') {
        await appointmentRepository.markReminder3DaySent(logEntry.appointment_id);
      } else if (logEntry.message_type === '1day_reminder') {
        await appointmentRepository.markReminderSent(logEntry.appointment_id);
      } else if (logEntry.message_type === 'same_day_reminder') {
        await appointmentRepository.markReminderSameDaySent(logEntry.appointment_id);
      } else if (logEntry.message_type === 'missed_reminder') {
        await appointmentRepository.markMissedSent(logEntry.appointment_id);
      } else if (logEntry.message_type === '7day_missed_reminder') {
        await appointmentRepository.markReminder7DayMissedSent(logEntry.appointment_id);
      }
    }

    return { success: true, sid: result.sid };
  } else {
    // Keep failed status but update the error message
    await notificationRepository.updateLogStatus(logId, 'failed', result.error);
    await notificationRepository.updateAppointmentStatusFlags(logEntry.appointment_id, logEntry.channel, false, result.error);
    return { success: false, error: result.error };
  }
};

module.exports = {
  sendAlertsAcrossChannels,
  retryFailedNotification
};
