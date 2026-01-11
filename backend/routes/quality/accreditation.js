const express = require('express');
const router = express.Router();
const accreditationController = require('../../controllers/quality/accreditation');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// SUB-MODULE 6: ACCREDITATION READINESS REPORTS
router.get('/readiness', authenticateToken, accreditationController.getReadinessScore);
router.get('/reports', authenticateToken, accreditationController.getAllReports);
router.post('/reports', authenticateToken, requireRole(['admin', 'staff']), accreditationController.generateReport);
router.get('/analytics', authenticateToken, accreditationController.getAccreditationAnalytics);

module.exports = router;
