const router = require('express').Router();
const auth   = require('../middleware/auth');

router.use(auth);

router.post('/', require('../controllers/projectController').createProject);
router.get('/',  require('../controllers/projectController').getProjects);
router.get('/:id', require('../controllers/projectController').getProject);
router.post('/:id/reschedule', require('../controllers/projectController').rescheduleProject);
router.get('/:id/progress',    require('../controllers/projectController').getProgress);

module.exports = router;