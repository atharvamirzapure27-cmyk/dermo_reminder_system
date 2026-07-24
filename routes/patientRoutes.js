const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const appointmentController = require('../controllers/appointmentController');
const { requireRole } = require('../middleware/authMiddleware');

// GET /patients - List all patients
router.get('/', patientController.getPatients);

// POST /patients - Add new patient
router.post('/', patientController.createPatient);

// GET /patients/:id/history - Get patient appointment history
router.get('/:id/history', requireRole(['super_admin', 'admin']), appointmentController.getPatientHistory);

module.exports = router;
