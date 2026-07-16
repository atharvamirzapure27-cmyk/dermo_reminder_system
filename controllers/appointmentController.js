const appointmentService = require('../services/appointmentService');
const {
  validateCreateAppointment,
  validateAppointmentId,
  validatePatientId,
  validateRescheduleAppointment
} = require('../validators/appointmentValidator');

const sendValidationError = (res, validation) => res.status(validation.status).json({
  success: false,
  message: validation.message
});

exports.getAppointments = async (req, res, next) => {
  try {
    const result = await appointmentService.getAppointments(req.query);
    console.log(`Fetched ${result.rows.length} appointments from database`);

    res.json({
      success: true,
      count: result.rows.length,
      total: result.total,
      pagination: result.pagination || undefined,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const validation = validateCreateAppointment(req.body);

    if (!validation.valid) {
      return sendValidationError(res, validation);
    }

    const appointment = await appointmentService.createAppointment(validation.data);
    console.log(`Appointment created: ID=${appointment.id}, patient_id=${appointment.patient_id}, date=${appointment.appointment_date}`);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

exports.markVisited = async (req, res, next) => {
  try {
    const validation = validateAppointmentId(req.params.id);

    if (!validation.valid) {
      return sendValidationError(res, validation);
    }

    console.log(`Marking appointment ${validation.data} as visited...`);
    await appointmentService.markVisited(validation.data);
    console.log(`Appointment ${validation.data} marked as visited`);

    res.json({
      success: true,
      message: 'Appointment marked as visited successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const validation = validateRescheduleAppointment(req.params.id, req.body);

    if (!validation.valid) {
      return sendValidationError(res, validation);
    }

    console.log(`Rescheduling appointment ${validation.data.id} to ${validation.data.appointment_date}...`);
    const appointment = await appointmentService.rescheduleAppointment(validation.data);
    console.log(`Appointment ${validation.data.id} rescheduled to ${validation.data.appointment_date}`);

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientHistory = async (req, res, next) => {
  try {
    const validation = validatePatientId(req.params.id);

    if (!validation.valid) {
      return sendValidationError(res, validation);
    }

    console.log(`Fetching appointment history for patient ${validation.data}...`);
    const history = await appointmentService.getPatientHistory(validation.data);
    console.log(`Found ${history.total} appointments for patient ${validation.data}`);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};
