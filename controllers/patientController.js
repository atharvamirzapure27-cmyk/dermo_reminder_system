const patientService = require('../services/patientService');
const { validateCreatePatient } = require('../validators/patientValidator');
const auditService = require('../services/auditService');

exports.getPatients = async (req, res, next) => {
  try {
    const result = await patientService.getPatients(req.query);
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

exports.createPatient = async (req, res, next) => {
  try {
    const validation = validateCreatePatient(req.body);

    if (!validation.valid) {
      return res.status(validation.status).json({
        success: false,
        message: validation.message
      });
    }

    const patient = await patientService.createPatient(validation.data);

    await auditService.log(req, 'patient_registered', `Registered patient ID=${patient.id}`);

    res.status(201).json({
      success: true,
      message: 'Patient added successfully',
      data: patient
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Patient with this phone number already exists'
      });
    }

    next(error);
  }
};
