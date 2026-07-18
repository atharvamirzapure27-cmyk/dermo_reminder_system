const appointmentRepository = require('../repositories/appointmentRepository');
const patientRepository = require('../repositories/patientRepository');
const HttpError = require('../utils/httpError');

const getAppointments = async (query = {}) => appointmentRepository.findAllWithPatients(query);

const createAppointment = async (appointmentData) => {
  const patientExists = await patientRepository.existsById(appointmentData.patient_id);

  if (!patientExists) {
    throw new HttpError(404, 'Patient not found');
  }

  return appointmentRepository.create(appointmentData);
};

const markVisited = async (id) => {
  const appointment = await appointmentRepository.findById(id);

  if (!appointment) {
    throw new HttpError(404, 'Appointment not found');
  }

  await appointmentRepository.markVisited(id);
};

const markMissed = async (id) => {
  const appointment = await appointmentRepository.findById(id);

  if (!appointment) {
    throw new HttpError(404, 'Appointment not found');
  }

  await appointmentRepository.markMissed(id);
};

const cancelAppointment = async (id) => {
  const appointment = await appointmentRepository.findById(id);

  if (!appointment) {
    throw new HttpError(404, 'Appointment not found');
  }

  await appointmentRepository.markCancelled(id);
};

const rescheduleAppointment = async ({ id, appointment_date, appointment_time }) => {
  const affectedRows = await appointmentRepository.reschedule(id, appointment_date, appointment_time);

  if (affectedRows === 0) {
    throw new HttpError(404, 'Appointment not found');
  }

  return {
    id,
    appointment_date,
    appointment_time
  };
};

const getPatientHistory = async (patientId) => {
  const patient = await patientRepository.findById(patientId);

  if (!patient) {
    throw new HttpError(404, 'Patient not found');
  }

  const appointments = await appointmentRepository.findByPatientId(patientId);

  return {
    patient,
    appointments,
    total: appointments.length
  };
};

module.exports = {
  getAppointments,
  createAppointment,
  markVisited,
  markMissed,
  cancelAppointment,
  rescheduleAppointment,
  getPatientHistory
};
