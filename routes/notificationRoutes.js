const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Authenticated managers only (admin & super_admin)
router.use(authenticateToken);
router.use(requireRole(['super_admin', 'admin']));

// GET /notifications/scheduler-status - Get scheduler status & statistics
router.get('/scheduler-status', notificationController.getSchedulerStatus);

// GET /notifications - Get list of recent notifications
router.get('/history', notificationController.getNotificationsHistory);

// POST /notifications/:id/retry - Resend a failed notification
router.post('/:id/retry', notificationController.retryFailedNotification);

// POST /notifications/test - Trigger manual notification test dispatches
router.post('/test', notificationController.triggerNotificationTest);

module.exports = router;
