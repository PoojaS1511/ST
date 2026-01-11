const express = require('express');
const router = express.Router();
const grievanceController = require('../../controllers/quality/grievances');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// SUB-MODULE 4: GRIEVANCE REPORTS
router.get('/', authenticateToken, grievanceController.getAllGrievances);
router.post('/', authenticateToken, grievanceController.submitGrievance);
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), grievanceController.updateGrievance);
router.delete('/:id', authenticateToken, requireRole(['admin']), grievanceController.deleteGrievance);
router.get('/analytics', authenticateToken, grievanceController.getGrievanceAnalytics);

module.exports = router;
