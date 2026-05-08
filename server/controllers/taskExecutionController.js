const taskRecommendationEngine = require('../services/taskRecommendationEngine');
const Project = require('../models/Project');
const Task = require('../models/Task');

/**
 * TASK EXECUTION CONTROLLER
 * 
 * Handles intelligent task execution workspace requests
 */

/**
 * Get task execution recommendations
 * GET /api/tasks/:taskId/execution
 */
exports.getTaskExecution = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Find project for context
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all tasks for dependency analysis
    const allTasks = await Task.find({ project: project._id });

    // Build project context
    const projectContext = {
      name: project.name,
      type: project.type || 'general',
      technologies: project.detectedTechnologies || [],
      deadline: project.deadline
    };

    // Generate recommendations
    const recommendations = await taskRecommendationEngine.generateRecommendations(
      {
        ...task.toObject(),
        description: task.description || '',
        estimatedHours: task.estimatedH || 1
      },
      projectContext,
      allTasks
    );

    res.json(recommendations);

  } catch (error) {
    console.error('[TaskExecutionController] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update task progress
 * POST /api/tasks/:taskId/progress
 */
exports.updateTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, progress, notes } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task
    if (status) task.status = status;
    if (progress !== undefined) task.progress = progress;
    if (notes) task.notes = notes;

    task.updatedAt = new Date();
    await task.save();

    // Broadcast update via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project}`).emit('task:updated', {
        taskId: task._id,
        status: task.status,
        progress: task.progress,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      task: {
        id: task._id,
        status: task.status,
        progress: task.progress
      }
    });

  } catch (error) {
    console.error('[TaskExecutionController] Progress update error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Start task execution
 * POST /api/tasks/:taskId/start
 */
exports.startTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = 'partial'; // Using 'partial' as in-progress equivalent
    task.startedAt = new Date();
    task.updatedAt = new Date();
    await task.save();

    // Broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project}`).emit('task:started', {
        taskId: task._id,
        title: task.title,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      task: {
        id: task._id,
        status: task.status,
        startedAt: task.startedAt
      }
    });

  } catch (error) {
    console.error('[TaskExecutionController] Start task error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Complete task
 * POST /api/tasks/:taskId/complete
 */
exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = 'done';
    task.completedAt = new Date();
    task.updatedAt = new Date();
    task.progress = 100;
    await task.save();

    // Broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project}`).emit('task:completed', {
        taskId: task._id,
        title: task.title,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      task: {
        id: task._id,
        status: task.status,
        completedAt: task.completedAt
      }
    });

  } catch (error) {
    console.error('[TaskExecutionController] Complete task error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
