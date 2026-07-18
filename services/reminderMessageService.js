const { fillTemplate } = require('../config/messageTemplates');

const formatDate = (value) => {
  const appointmentDate = new Date(value);
  return appointmentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const get3DayReminderMessage = (appointment) => {
  return fillTemplate('reminder_3day', appointment.language, {
    name: appointment.patient_name,
    doctor: appointment.doctor_name,
    date: formatDate(appointment.appointment_date),
    time: appointment.appointment_time || '10:00 AM'
  });
};

const get1DayReminderMessage = (appointment) => {
  return fillTemplate('reminder_1day', appointment.language, {
    name: appointment.patient_name,
    doctor: appointment.doctor_name,
    date: formatDate(appointment.appointment_date),
    time: appointment.appointment_time || '10:00 AM'
  });
};

const getMissedMessage = (appointment) => {
  return fillTemplate('reminder_missed', appointment.language, {
    name: appointment.patient_name,
    doctor: appointment.doctor_name,
    date: formatDate(appointment.appointment_date)
  });
};

// Legacy compatibility
const getReminderMessage = get1DayReminderMessage;

module.exports = {
  get3DayReminderMessage,
  get1DayReminderMessage,
  getReminderMessage,
  getMissedMessage
};
