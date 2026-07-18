const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, requireRole(['super_admin']), userController.getUsers);
router.post('/', authenticateToken, requireRole(['super_admin']), userController.createUser);
router.delete('/:id', authenticateToken, requireRole(['super_admin']), userController.deleteUser);
router.get('/audit-logs', authenticateToken, requireRole(['super_admin', 'admin']), userController.getAuditLogs);

module.exports = router;
