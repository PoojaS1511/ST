const express = require('express');
const router = express.Router();
const facultyController = require('../../controllers/quality/faculty');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// SUB-MODULE 2: FACULTY PERFORMANCE DATA
router.get('/', authenticateToken, facultyController.getAllFaculty);
router.post('/', authenticateToken, requireRole(['admin', 'staff']), facultyController.addFaculty);
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), facultyController.updateFaculty);
router.delete('/:id', authenticateToken, requireRole(['admin']), facultyController.deleteFaculty);
router.get('/analytics', authenticateToken, facultyController.getFacultyAnalytics);

module.exports = router;
