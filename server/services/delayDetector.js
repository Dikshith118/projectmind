const Project = require('../models/Project');
const Task    = require('../models/Task');

exports.runDelayDetection = async (projectId) => {
  const project   = await Project.findById(projectId);
  if (!project) return;

  const createdAt  = new Date(project.createdAt);
  const today      = new Date();
  const dayNumber  = Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24));

  // How many tasks should be done by today
  const plannedCount    = await Task.countDocuments({
    project: projectId,
    day:     { $lte: dayNumber },
  });

  // How many are actually done
  const completedCount  = await Task.countDocuments({
    project: projectId,
    status:  'done',
  });

  const daysBehind = Math.max(0, plannedCount - completedCount);
  const status     = daysBehind >= 2 ? 'delayed' : 'on-track';

  await Project.findByIdAndUpdate(projectId, { status, daysBehind });

  console.log(`[Delay] Project "${project.name}" — ${daysBehind} days behind → ${status}`);

  return { daysBehind, status, plannedCount, completedCount };
};