const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getExplainedRisk,
  getExplainedProductivity,
  getExplainedTaskPriority,
  getExplainedFocusRecommendation,
  getExplainedRecoveryPlan,
  getAllExplanations
} = require('../controllers/explainableAIController');

// Get explained risk assessment
router.get('/:projectId/risk', auth, getExplainedRisk);

// Get explained productivity score
router.get('/:projectId/productivity', auth, getExplainedProductivity);

// Get explained task priority
router.get('/:projectId/task/:taskId/priority', auth, getExplainedTaskPriority);

// Get explained focus recommendation
router.get('/:projectId/focus', auth, getExplainedFocusRecommendation);

// Get explained recovery plan
router.get('/:projectId/recovery', auth, getExplainedRecoveryPlan);

// Get all explanations
router.get('/:projectId/all', auth, getAllExplanations);

module.exports = router;
