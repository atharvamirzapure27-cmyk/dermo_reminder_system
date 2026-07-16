const appointmentRepository = require('../repositories/appointmentRepository');
const { sendSMS } = require('./twilioService');
const { getLocalDateString } = require('../validators/commonValidators');
const { getReminderMessage, getMissedMessage } = require('./reminderMessageService');

const sendAppointmentMessages = async ({ appointments, messageBuilder, onSuccess, label }) => {
  let successCount = 0;
  let failCount = 0;

  for (const appointment of appointments) {
    const message = messageBuilder(appointment);

    try {
      const result = await sendSMS(appointment.patient_phone, message);

      if (result.success) {
        console.log(`SMS sent to ${appointment.patient_name} (${appointment.patient_phone}) [Language: ${appointment.language}]`);
        await onSuccess(appointment.id);
        successCount++;
      } else {
        console.error(`Failed to send ${label} SMS to ${appointment.patient_name} (${appointment.patient_phone})`);
        console.error('Error:', result.error);
        failCount++;
      }
    } catch (error) {
      console.error(`Exception sending ${label} SMS to ${appointment.patient_name} (${appointment.patient_phone})`);
      console.error('Error:', error.message);
      failCount++;
    }
  }

  return { successCount, failCount };
};

const sendReminders = async () => {
  try {
    console.log('\nStarting SMS reminder job...');
    console.log(`   Current local time: ${new Date().toLocaleString()}`);

    const localDate = getLocalDateString();
    console.log(`   Local date for reminders: ${localDate}`);

    const todayAppointments = await appointmentRepository.findPendingRemindersByDate(localDate);

    if (todayAppointments.length > 0) {
      console.log(`Sending ${todayAppointments.length} reminder(s) for today's appointments...`);
      const result = await sendAppointmentMessages({
        appointments: todayAppointments,
        messageBuilder: getReminderMessage,
        onSuccess: appointmentRepository.markReminderSent,
        label: 'reminder'
      });
      console.log(`Reminder job completed: ${result.successCount} succeeded, ${result.failCount} failed\n`);
    } else {
      console.log('No reminders to send today\n');
    }

    const missedAppointments = await appointmentRepository.findMissedNotificationsBeforeDate(localDate);

    if (missedAppointments.length > 0) {
      console.log(`Sending ${missedAppointments.length} missed appointment notification(s)...`);
      const result = await sendAppointmentMessages({
        appointments: missedAppointments,
        messageBuilder: getMissedMessage,
        onSuccess: appointmentRepository.markMissedSent,
        label: 'missed'
      });
      console.log(`Missed notifications: ${result.successCount} succeeded, ${result.failCount} failed\n`);
    } else {
      console.log('No missed appointments to notify\n');
    }
  } catch (error) {
    console.error('Error in sendReminders:', error.message);
    console.error(error.stack);
  }
};

module.exports = { sendReminders };
