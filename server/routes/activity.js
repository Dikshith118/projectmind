const router  = require('express').Router();
const { receive } = require('../controllers/activityController');

router.post('/', receive);

module.exports = router;