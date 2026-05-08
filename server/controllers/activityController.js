const ActivityLog = require('../models/ActivityLog');
const Project     = require('../models/Project');
const { processActivity }   = require('../services/taskMapper');
const { runDelayDetection } = require('../services/delayDetector');
const activityAnalyzer = require('../services/activityAnalyzer');
const taskCorrelationEngine = require('../services/taskCorrelationEngine');
const productivityScorer = require('../services/productivityScorer');
const insightGenerator = require('../services/insightGenerator');
const realtimeEventBroadcaster = require('../services/realtimeEventBroadcaster');

exports.receive = async (req, res) => {
  try {
    const { projectId, token, events } = req.body;

    if (!projectId || !events || !events.length) {
      return res.status(400).json({ error: 'projectId and events are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('[Activity] Received ' + events.length + ' events for "' + project.name + '"');

    // Store activity logs
    const savedActivities = await ActivityLog.insertMany(
      events.map(function(e) {
        return {
          project:   projectId,
          file:      e.file,
          event:     e.event,
          duration:  e.duration || 0,
          timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
        };
      })
    );

    // Process activity for task mapping
    await processActivity(projectId, events);

    // Run delay detection
    const result = await runDelayDetection(projectId);

    // Broadcast real-time activity events
    events.forEach((event, index) => {
      realtimeEventBroadcaster.broadcastActivity(projectId, {
        file: event.file.split(/[\\/]/).pop(),
        fullPath: event.file,
        event: event.event,
        duration: event.duration || 0,
        timestamp: savedActivities[index].timestamp
      });
    });

    // Check for risk level changes
    const oldRiskLevel = project.daysBehind > 2 ? 'High' : project.daysBehind > 0 ? 'Medium' : 'Low';
    const newRiskLevel = result.daysBehind > 2 ? 'High' : result.daysBehind > 0 ? 'Medium' : 'Low';
    
    if (oldRiskLevel !== newRiskLevel) {
      realtimeEventBroadcaster.broadcastRiskChange(
        projectId,
        oldRiskLevel,
        newRiskLevel,
        [`Days behind changed from ${project.daysBehind} to ${result.daysBehind}`]
      );
    }

    // Update project if days behind changed
    if (project.daysBehind !== result.daysBehind) {
      project.daysBehind = result.daysBehind;
      project.status = result.status;
      await project.save();

      realtimeEventBroadcaster.broadcastProjectUpdate(projectId, {
        daysBehind: result.daysBehind,
        status: result.status
      });
    }

    // Detect focus sessions (if continuous activity for 25+ min)
    try {
      const recentActivity = await ActivityLog.find({ project: projectId })
        .sort('-timestamp')
        .limit(50);
      
      if (recentActivity.length >= 10) {
        const firstTimestamp = recentActivity[recentActivity.length - 1].timestamp;
        const lastTimestamp = recentActivity[0].timestamp;
        const duration = (lastTimestamp - firstTimestamp) / 60000; // minutes

        if (duration >= 25) {
          realtimeEventBroadcaster.broadcastFocusSessionStart(projectId, {
            duration: Math.round(duration),
            events: recentActivity.length,
            startTime: firstTimestamp
          });
        }
      }
    } catch (err) {
      console.log('[Activity] Focus session detection skipped:', err.message);
    }

    // Detect task inference (AI detected completion)
    try {
      const activeTask = await taskCorrelationEngine.getActiveTask(projectId);
      if (activeTask) {
        const confidence = await taskCorrelationEngine.calculateCompletionConfidence(projectId, activeTask.taskId);
        
        if (confidence.confidence >= 70) {
          realtimeEventBroadcaster.broadcastTaskInference(projectId, {
            taskId: activeTask.taskId,
            taskTitle: activeTask.taskTitle,
            confidence: confidence.confidence,
            reason: confidence.reason
          });
        }
      }
    } catch (err) {
      console.log('[Activity] Task inference skipped:', err.message);
    }

    res.json({
      received:   events.length,
      daysBehind: result ? result.daysBehind : 0,
      status:     result ? result.status : 'on-track',
    });

  } catch (err) {
    console.error('[Activity] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get productivity analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const days = parseInt(req.query.days) || 7;

    const [
      productivity,
      taskProgress,
      stalledTasks,
      activeTask,
      focusSessions,
      fileDistribution
    ] = await Promise.all([
      productivityScorer.getProductivityReport(projectId, days),
      taskCorrelationEngine.estimateTaskProgress(projectId),
      taskCorrelationEngine.detectStalledTasks(projectId),
      taskCorrelationEngine.getActiveTask(projectId),
      activityAnalyzer.detectFocusSessions(projectId, days),
      activityAnalyzer.getFileActivityDistribution(projectId, days)
    ]);

    res.json({
      productivity,
      taskProgress,
      stalledTasks,
      activeTask,
      focusSessions,
      fileDistribution,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('[Activity] Analytics error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get AI insights
exports.getInsights = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const insights = await insightGenerator.generateInsights(projectId, project.name);

    res.json(insights);

  } catch (err) {
    console.error('[Activity] Insights error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get real-time activity feed
exports.getActivityFeed = async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const activities = await ActivityLog.find({ project: projectId })
      .sort('-timestamp')
      .limit(limit);

    const feed = activities.map(a => ({
      file: a.file.split(/[\\/]/).pop(), // Just filename
      event: a.event,
      timestamp: a.timestamp,
      timeAgo: getTimeAgo(a.timestamp)
    }));

    res.json(feed);

  } catch (err) {
    console.error('[Activity] Feed error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Helper function
function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}