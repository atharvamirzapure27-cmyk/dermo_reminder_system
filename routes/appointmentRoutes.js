const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// GET /appointments - List all appointments
router.get('/', appointmentController.getAppointments);

// POST /appointments - Create new appointment
router.post('/', appointmentController.createAppointment);

// PUT /appointments/:id/visited - Mark as visited
router.put('/:id/visited', appointmentController.markVisited);

// PUT /appointments/:id/reschedule - Reschedule appointment
router.put('/:id/reschedule', appointmentController.rescheduleAppointment);

module.exports = router;
