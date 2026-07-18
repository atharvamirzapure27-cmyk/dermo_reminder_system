const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { requireRole } = require('../middleware/authMiddleware');

// GET /appointments - List all appointments
router.get('/', appointmentController.getAppointments);

// POST /appointments - Create new appointment
router.post('/', appointmentController.createAppointment);

// POST /appointments/reminders/trigger - Trigger manual reminders check
router.post('/reminders/trigger', requireRole(['super_admin', 'admin']), appointmentController.triggerReminders);

// PUT /appointments/:id/visited - Mark as visited
router.put('/:id/visited', appointmentController.markVisited);

// PUT /appointments/:id/missed - Mark as missed
router.put('/:id/missed', appointmentController.markMissed);

// PUT /appointments/:id/cancel - Cancel appointment
router.put('/:id/cancel', appointmentController.cancelAppointment);

// PUT /appointments/:id/reschedule - Reschedule appointment
router.put('/:id/reschedule', appointmentController.rescheduleAppointment);

module.exports = router;
