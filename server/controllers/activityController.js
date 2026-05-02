const ActivityLog = require('../models/ActivityLog');
const Project     = require('../models/Project');
const { processActivity }   = require('../services/taskMapper');
const { runDelayDetection } = require('../services/delayDetector');

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

    await ActivityLog.insertMany(
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

    await processActivity(projectId, events);

    const result = await runDelayDetection(projectId);

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