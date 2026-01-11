const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/quality/analytics');
const { authenticateToken } = require('../../middleware/auth');

// SUB-MODULE 7: REAL-TIME ANALYTICS
router.get('/comprehensive', authenticateToken, analyticsController.getComprehensiveAnalytics);
router.get('/insights', authenticateToken, analyticsController.getAIInsights);

module.exports = router;
