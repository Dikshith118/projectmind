const ActivityLog = require('../models/ActivityLog');
const TaskMapping = require('../models/TaskMapping');
const Task = require('../models/Task');

/**
 * Correlate file activity with tasks to estimate progress
 */
class TaskCorrelationEngine {
  
  /**
   * Map recent edits to tasks using TaskMapping
   */
  async mapEditsToTasks(projectId, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get recent activities
    const activities = await ActivityLog.find({
      project: projectId,
      timestamp: { $gte: since }
    }).sort('-timestamp');
    
    // Get task mappings
    const mappings = await TaskMapping.find({ project: projectId }).populate('taskId');
    
    // Build file -> task lookup
    const fileToTasks = {};
    mappings.forEach(mapping => {
      mapping.paths.forEach(path => {
        if (!fileToTasks[path]) {
          fileToTasks[path] = [];
        }
        fileToTasks[path].push(mapping.taskId);
      });
    });
    
    // Map activities to tasks
    const taskActivity = {};
    
    activities.forEach(activity => {
      const matchedTasks = fileToTasks[activity.file] || [];
      
      matchedTasks.forEach(task => {
        if (!task) return;
        
        const taskId = task._id.toString();
        
        if (!taskActivity[taskId]) {
          taskActivity[taskId] = {
            task,
            edits: 0,
            saves: 0,
            opens: 0,
            totalEvents: 0,
            files: new Set(),
            lastActivity: activity.timestamp
          };
        }
        
        taskActivity[taskId][activity.event + 's']++;
        taskActivity[taskId].totalEvents++;
        taskActivity[taskId].files.add(activity.file);
        
        if (activity.timestamp > taskActivity[taskId].lastActivity) {
          taskActivity[taskId].lastActivity = activity.timestamp;
        }
      });
    });
    
    // Convert to array
    const results = Object.values(taskActivity).map(data => ({
      taskId: data.task._id,
      taskTitle: data.task.title,
      taskStatus: data.task.status,
      day: data.task.day,
      edits: data.edits,
      saves: data.saves,
      opens: data.opens,
      totalEvents: data.totalEvents,
      filesWorkedOn: data.files.size,
      lastActivity: data.lastActivity
    }));
    
    return results.sort((a, b) => b.totalEvents - a.totalEvents);
  }
  
  /**
   * Estimate task progress based on activity
   */
  async estimateTaskProgress(projectId) {
    const taskActivity = await this.mapEditsToTasks(projectId, 168); // 7 days
    
    const estimates = taskActivity.map(activity => {
      let progressEstimate = 0;
      let confidence = 0;
      
      // Calculate progress based on activity patterns
      if (activity.taskStatus === 'done') {
        progressEstimate = 100;
        confidence = 100;
      } else if (activity.taskStatus === 'partial') {
        progressEstimate = 50;
        confidence = 70;
      } else {
        // Estimate based on activity
        const activityScore = Math.min(activity.totalEvents / 20, 1); // 20+ events = likely complete
        const fileScore = Math.min(activity.filesWorkedOn / 3, 1); // 3+ files = good coverage
        const saveScore = Math.min(activity.saves / 5, 1); // 5+ saves = substantial work
        
        progressEstimate = Math.round((activityScore * 0.4 + fileScore * 0.3 + saveScore * 0.3) * 100);
        confidence = Math.round((activity.totalEvents / 30) * 100);
        confidence = Math.min(confidence, 85); // Max 85% confidence for pending tasks
      }
      
      return {
        taskId: activity.taskId,
        taskTitle: activity.taskTitle,
        currentStatus: activity.taskStatus,
        estimatedProgress: progressEstimate,
        confidence: Math.min(confidence, 100),
        activityMetrics: {
          totalEvents: activity.totalEvents,
          edits: activity.edits,
          saves: activity.saves,
          filesWorkedOn: activity.filesWorkedOn
        },
        lastActivity: activity.lastActivity
      };
    });
    
    return estimates;
  }
  
  /**
   * Calculate completion confidence for tasks
   */
  async calculateCompletionConfidence(projectId, taskId) {
    const activities = await ActivityLog.find({
      project: projectId
    }).sort('-timestamp').limit(100);
    
    const mapping = await TaskMapping.findOne({
      project: projectId,
      taskId
    });
    
    if (!mapping) {
      return { confidence: 0, reason: 'No file mapping found' };
    }
    
    // Count activities on mapped files
    const relevantActivities = activities.filter(a => 
      mapping.paths.some(path => a.file.includes(path))
    );
    
    const edits = relevantActivities.filter(a => a.event === 'edit').length;
    const saves = relevantActivities.filter(a => a.event === 'save').length;
    
    // Calculate confidence
    let confidence = 0;
    let reason = '';
    
    if (saves >= 5 && edits >= 10) {
      confidence = 85;
      reason = 'High activity detected (5+ saves, 10+ edits)';
    } else if (saves >= 3 && edits >= 5) {
      confidence = 60;
      reason = 'Moderate activity detected';
    } else if (saves >= 1) {
      confidence = 30;
      reason = 'Some activity detected';
    } else {
      confidence = 5;
      reason = 'Minimal activity detected';
    }
    
    return {
      confidence,
      reason,
      metrics: {
        edits,
        saves,
        totalActivities: relevantActivities.length
      }
    };
  }
  
  /**
   * Detect blocked or stalled tasks
   */
  async detectStalledTasks(projectId) {
    const tasks = await Task.find({ project: projectId, status: { $ne: 'done' } });
    const stalledTasks = [];
    
    for (const task of tasks) {
      const mapping = await TaskMapping.findOne({
        project: projectId,
        taskId: task._id
      });
      
      if (!mapping || mapping.paths.length === 0) {
        stalledTasks.push({
          taskId: task._id,
          taskTitle: task.title,
          day: task.day,
          status: task.status,
          reason: 'No file mapping',
          stalledDays: 0,
          lastActivity: null
        });
        continue;
      }
      
      // Check last activity on mapped files
      const lastActivity = await ActivityLog.findOne({
        project: projectId,
        file: { $in: mapping.paths }
      }).sort('-timestamp');
      
      if (!lastActivity) {
        stalledTasks.push({
          taskId: task._id,
          taskTitle: task.title,
          day: task.day,
          status: task.status,
          reason: 'No activity detected',
          stalledDays: 0,
          lastActivity: null
        });
        continue;
      }
      
      // Calculate days since last activity
      const daysSinceActivity = (Date.now() - lastActivity.timestamp) / (24 * 60 * 60 * 1000);
      
      if (daysSinceActivity >= 2) {
        stalledTasks.push({
          taskId: task._id,
          taskTitle: task.title,
          day: task.day,
          status: task.status,
          reason: `No activity for ${Math.round(daysSinceActivity)} days`,
          stalledDays: Math.round(daysSinceActivity),
          lastActivity: lastActivity.timestamp
        });
      }
    }
    
    return stalledTasks.sort((a, b) => b.stalledDays - a.stalledDays);
  }
  
  /**
   * Get currently active task (most recent activity)
   */
  async getActiveTask(projectId) {
    const recentActivities = await ActivityLog.find({
      project: projectId
    }).sort('-timestamp').limit(20);
    
    if (recentActivities.length === 0) {
      return null;
    }
    
    // Get all mappings
    const mappings = await TaskMapping.find({ project: projectId }).populate('taskId');
    
    // Build file -> task lookup
    const fileToTasks = {};
    mappings.forEach(mapping => {
      mapping.paths.forEach(path => {
        if (!fileToTasks[path]) {
          fileToTasks[path] = [];
        }
        fileToTasks[path].push(mapping.taskId);
      });
    });
    
    // Find most recent task
    for (const activity of recentActivities) {
      const tasks = fileToTasks[activity.file];
      if (tasks && tasks.length > 0) {
        const task = tasks[0];
        return {
          taskId: task._id,
          taskTitle: task.title,
          taskStatus: task.status,
          day: task.day,
          file: activity.file,
          lastActivity: activity.timestamp,
          event: activity.event
        };
      }
    }
    
    return null;
  }
}

module.exports = new TaskCorrelationEngine();
