const Task        = require('../models/Task');
const TaskMapping = require('../models/TaskMapping');

exports.processActivity = async (projectId, events) => {
  const mappings = await TaskMapping.find({ project: projectId });

  if (!mappings.length) {
    console.log('[Mapper] No mappings found for project:', projectId);
    return;
  }

  const minutesByTask = {};

  for (const event of events) {
    const normalised = event.file.replace(/\\/g, '/').toLowerCase();

    for (const m of mappings) {
      const matched = m.paths.some(p => normalised.includes(p.toLowerCase()));
      if (!matched) continue;

      // Simpler scoring — each event adds fixed minutes
      const mins = event.event === 'commit' ? 30
                 : event.event === 'save'   ? 15
                 : event.event === 'edit'   ? 20
                 : 5; // open

      minutesByTask[m.taskId] = (minutesByTask[m.taskId] || 0) + mins;
    }
  }

  for (const [taskId, minutes] of Object.entries(minutesByTask)) {
    const task = await Task.findById(taskId);
    if (!task) continue;

    const totalMins  = (task.activityMinutes || 0) + minutes;
    const targetMins = task.estimatedH * 60;
    const ratio      = totalMins / targetMins;

    const status = ratio >= 0.8 ? 'done'
                 : ratio >= 0.2 ? 'partial'
                 : 'pending';

    await Task.findByIdAndUpdate(taskId, { activityMinutes: totalMins, status });
    console.log(`[Mapper] Task "${task.title}" → ${status} (${Math.round(ratio * 100)}%)`);
  }
};