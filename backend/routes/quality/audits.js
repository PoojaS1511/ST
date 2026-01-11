const express = require('express');
const router = express.Router();
const auditController = require('../../controllers/quality/audits');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// SUB-MODULE 3: AUDIT RECORDS
router.get('/', authenticateToken, auditController.getAllAudits);
router.post('/', authenticateToken, requireRole(['admin', 'staff']), auditController.createAudit);
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), auditController.updateAudit);
router.delete('/:id', authenticateToken, requireRole(['admin']), auditController.deleteAudit);
router.get('/overdue', authenticateToken, auditController.getOverdueAudits);
router.get('/analytics', authenticateToken, auditController.getAuditAnalytics);

module.exports = router;
