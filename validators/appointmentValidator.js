const { isValidDateString, isValidId, normalizeDate } = require('./commonValidators');

const validateCreateAppointment = (body) => {
  const normalizedPatientId = Number(body.patient_id);
  const normalizedDate = normalizeDate(body.appointment_date);

  if (!normalizedPatientId || !normalizedDate) {
    return { valid: false, status: 400, message: 'Patient ID and appointment date are required' };
  }

  if (!isValidId(body.patient_id)) {
    return { valid: false, status: 400, message: 'Patient ID must be a positive number' };
  }

  if (!isValidDateString(normalizedDate)) {
    return { valid: false, status: 400, message: 'Invalid date format. Use YYYY-MM-DD' };
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
      appointment_date: normalizedDate
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

  if (!normalizedDate) {
    return { valid: false, status: 400, message: 'New appointment date is required' };
  }

  if (!isValidDateString(normalizedDate)) {
    return { valid: false, status: 400, message: 'Invalid date format. Use YYYY-MM-DD' };
  }

  return {
    valid: true,
    data: {
      id: idValidation.data,
      appointment_date: normalizedDate
    }
  };
};

module.exports = {
  validateCreateAppointment,
  validateAppointmentId,
  validatePatientId,
  validateRescheduleAppointment
};
