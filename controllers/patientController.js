const patientService = require('../services/patientService');
const { validateCreatePatient } = require('../validators/patientValidator');

exports.getPatients = async (req, res, next) => {
  try {
    const rows = await patientService.getPatients();
    res.json({
      success: true,
      count: rows.length,
      data: rows
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
