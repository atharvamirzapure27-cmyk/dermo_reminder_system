const { isValidDateString, isValidId, normalizeDate } = require('./commonValidators');

const validateCreateAppointment = (body) => {
  const normalizedPatientId = Number(body.patient_id);
  const normalizedDate = normalizeDate(body.appointment_date);
  const doctorName = body.doctor_name ? body.doctor_name.trim() : 'Dr. Priya Sharma';
  const appointmentTime = body.appointment_time ? body.appointment_time.trim() : '10:00 AM';

  if (!normalizedPatientId || !normalizedDate) {
    return { valid: false, status: 400, message: 'Patient ID and appointment date are required' };
  }

  if (!isValidId(body.patient_id)) {
    return { valid: false, status: 400, message: 'Patient ID must be a positive number' };
  }

  if (!isValidDateString(normalizedDate)) {
    return { valid: false, status: 400, message: 'Invalid date format. Use YYYY-MM-DD' };
  }

  if (doctorName.length < 3) {
    return { valid: false, status: 400, message: 'Doctor name must be at least 3 characters long' };
  }

  if (appointmentTime.length < 3) {
    return { valid: false, status: 400, message: 'Appointment time must be at least 3 characters long' };
  }

  const [year, month, day] = normalizedDate.split('-').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return { valid: false, status: 400, message: 'Appointment date cannot be in the past' };
  }

  return {
    valid: true,
    data: {
      patient_id: normalizedPatientId,
      appointment_date: normalizedDate,
      doctor_name: doctorName,
      appointment_time: appointmentTime
    }
  };
};

const validateAppointmentId = (id) => {
  if (!isValidId(id)) {
    return { valid: false, status: 400, message: 'Invalid appointment ID' };
  }

  return { valid: true, data: Number(id) };
};

const validatePatientId = (id) => {
  if (!isValidId(id)) {
    return { valid: false, status: 400, message: 'Invalid patient ID' };
  }

  return { valid: true, data: Number(id) };
};

const validateRescheduleAppointment = (id, body) => {
  const idValidation = validateAppointmentId(id);
  if (!idValidation.valid) {
    return idValidation;
  }

  const normalizedDate = normalizeDate(body.appointment_date);
  const appointmentTime = body.appointment_time ? body.appointment_time.trim() : null;

  if (!normalizedDate) {
    return { valid: false, status: 400, message: 'New appointment date is required' };
  }

  if (!isValidDateString(normalizedDate)) {
    return { valid: false, status: 400, message: 'Invalid date format. Use YYYY-MM-DD' };
  }

  if (!appointmentTime || appointmentTime.length < 3) {
    return { valid: false, status: 400, message: 'New appointment time must be at least 3 characters long' };
  }

  const [year, month, day] = normalizedDate.split('-').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return { valid: false, status: 400, message: 'Rescheduled date cannot be in the past' };
  }

  return {
    valid: true,
    data: {
      id: idValidation.data,
      appointment_date: normalizedDate,
      appointment_time: appointmentTime
    }
  };
};

module.exports = {
  validateCreateAppointment,
  validateAppointmentId,
  validatePatientId,
  validateRescheduleAppointment
};
