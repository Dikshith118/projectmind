const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  generateDemo,
  getNextAction,
  generateRecoveryPlan,
} = require('../controllers/aiDemoController');

router.use(auth);

router.post('/demo', generateDemo);
router.post('/next-action', getNextAction);
router.post('/recovery-plan', generateRecoveryPlan);

module.exports = router;
