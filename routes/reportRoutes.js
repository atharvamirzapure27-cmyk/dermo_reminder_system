const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/:type', reportController.getReport);
router.get('/:type/export/:format', reportController.exportReport);

module.exports = router;
