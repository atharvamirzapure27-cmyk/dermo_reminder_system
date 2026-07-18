const appointmentService = require('../services/appointmentService');
const auditService = require('../services/auditService');
const { sendReminders } = require('../services/reminderService');
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
    console.log(`Appointment created: ID=${appointment.id}, patient_id=${appointment.patient_id}, date=${appointment.appointment_date}, time=${appointment.appointment_time}`);

    await auditService.log(
      req, 
      'appointment_scheduled', 
      `Scheduled appointment ID=${appointment.id} for patient ID=${appointment.patient_id} with ${appointment.doctor_name} at ${appointment.appointment_time} on ${appointment.appointment_date}`
    );

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

    await auditService.log(req, 'appointment_visited', `Marked appointment ID=${validation.data} as visited`);

    res.json({
      success: true,
      message: 'Appointment marked as visited successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.markMissed = async (req, res, next) => {
  try {
    const validation = validateAppointmentId(req.params.id);

    if (!validation.valid) {
      return sendValidationError(res, validation);
    }

    console.log(`Marking appointment ${validation.data} as missed...`);
    await appointmentService.markMissed(validation.data);
    console.log(`Appointment ${validation.data} marked as missed`);

    await auditService.log(req, 'appointment_missed', `Marked appointment ID=${validation.data} as missed`);

    res.json({
      success: true,
      message: 'Appointment marked as missed successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const validation = validateAppointmentId(req.params.id);

    if (!validation.valid) {
      return sendValidationError(res, validation);
    }

    console.log(`Cancelling appointment ${validation.data}...`);
    await appointmentService.cancelAppointment(validation.data);
    console.log(`Appointment ${validation.data} cancelled`);

    await auditService.log(req, 'appointment_cancelled', `Cancelled appointment ID=${validation.data}`);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
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

    console.log(`Rescheduling appointment ${validation.data.id} to ${validation.data.appointment_date} at ${validation.data.appointment_time}...`);
    const appointment = await appointmentService.rescheduleAppointment(validation.data);
    console.log(`Appointment ${validation.data.id} rescheduled to ${validation.data.appointment_date} at ${validation.data.appointment_time}`);

    await auditService.log(
      req, 
      'appointment_rescheduled', 
      `Rescheduled appointment ID=${validation.data.id} to ${validation.data.appointment_date} at ${validation.data.appointment_time}`
    );

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

exports.triggerReminders = async (req, res, next) => {
  try {
    console.log(`[Admin] Manual reminder sweep triggered by user ${req.user?.username || 'system'}`);
    const result = await sendReminders(true);
    
    await auditService.log(
      req, 
      'reminder_sweep_triggered', 
      `Manually triggered reminder scan. Status: ${result.status}`
    );

    res.json({
      success: true,
      message: 'Reminder sweep executed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
