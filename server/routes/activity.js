const router  = require('express').Router();
const { 
  receive, 
  getAnalytics, 
  getInsights, 
  getActivityFeed 
} = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.post('/', receive);
router.get('/:projectId/analytics', auth, getAnalytics);
router.get('/:projectId/insights', auth, getInsights);
router.get('/:projectId/feed', auth, getActivityFeed);

module.exports = router;