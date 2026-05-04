const router = require('express').Router();
const auth   = require('../middleware/auth');

router.use(auth);

router.post('/', require('../controllers/projectController').createProject);
router.get('/',  require('../controllers/projectController').getProjects);
router.get('/:id', require('../controllers/projectController').getProject);
router.post('/:id/reschedule', require('../controllers/projectController').rescheduleProject);
router.get('/:id/progress',    require('../controllers/projectController').getProgress);

module.exports = router;

router.get('/:id/heatmap', async (req, res) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    const logs = await ActivityLog.find({
      project: req.params.id
    }).sort('timestamp');

    const heatmap = {};

    for (const log of logs) {
      const date = new Date(log.timestamp);
      const day  = date.toLocaleDateString('en-US', { weekday: 'short' });
      const hour = date.getHours();
      const key  = `${day}-${hour}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    }

    res.json(heatmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});