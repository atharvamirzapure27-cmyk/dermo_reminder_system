const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(requireRole(['super_admin', 'admin']));

router.get('/notifications', settingsController.getSettings);
router.put('/notifications', settingsController.updateSettings);

module.exports = router;
