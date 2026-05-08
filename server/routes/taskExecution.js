const express = require('express');
const router = express.Router();
const taskExecutionController = require('../controllers/taskExecutionController');
const auth = require('../middleware/auth');

/**
 * TASK EXECUTION ROUTES
 * 
 * Intelligent task execution workspace endpoints
 */

// Get task execution recommendations
router.get('/:taskId/execution', auth, taskExecutionController.getTaskExecution);

// Update task progress
router.post('/:taskId/progress', auth, taskExecutionController.updateTaskProgress);

// Start task
router.post('/:taskId/start', auth, taskExecutionController.startTask);

// Complete task
router.post('/:taskId/complete', auth, taskExecutionController.completeTask);

module.exports = router;
