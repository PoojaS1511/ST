const express = require('express');
const router = express.Router();
const policyController = require('../../controllers/quality/policies');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// SUB-MODULE 5: POLICY COMPLIANCE STATUS
router.get('/', authenticateToken, policyController.getAllPolicies);
router.post('/', authenticateToken, requireRole(['admin', 'staff']), policyController.addPolicy);
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), policyController.updatePolicy);
router.delete('/:id', authenticateToken, requireRole(['admin']), policyController.deletePolicy);
router.get('/non-compliant', authenticateToken, policyController.getNonCompliantPolicies);
router.get('/due-for-review', authenticateToken, policyController.getPoliciesDueForReview);
router.get('/analytics', authenticateToken, policyController.getPolicyAnalytics);

module.exports = router;
