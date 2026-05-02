const Project     = require('../models/Project');
const Task        = require('../models/Task');
const TaskMapping = require('../models/TaskMapping');
const { breakdownProject, rescheduleProject } = require('../services/claudeService');
const { runDelayDetection } = require('../services/delayDetector');

exports.createProject = async (req, res) => {
  try {
    const { name, goal, deadline, hoursPerDay } = req.body;
    if (!name || !goal || !deadline || !hoursPerDay) {
      return res.status(400).json({ error: 'name, goal, deadline, hoursPerDay are required' });
    }
    const project = await Project.create({
      user: req.user.userId,
      name,
      goal,
      deadline,
      hoursPerDay,
    });
    console.log('Calling AI for task breakdown...');
    const { tasks, mapping } = await breakdownProject({ name, goal, deadline, hoursPerDay });
    console.log('AI returned ' + tasks.length + ' tasks');
    const idMap = {};
    const savedTasks = [];
    for (const t of tasks) {
      const task = await Task.create({
        project:      project._id,
        day:          t.day,
        title:        t.title,
        estimatedH:   t.estimatedH,
        priority:     t.priority,
        dependencies: t.dependencies || [],
      });
      idMap[t.id] = task._id;
      savedTasks.push(task);
    }
    for (const [tempId, paths] of Object.entries(mapping)) {
      const realId = idMap[tempId];
      if (!realId) continue;
      await TaskMapping.create({
        project: project._id,
        taskId:  realId,
        paths,
      });
    }
    res.status(201).json({
      project,
      tasks:   savedTasks,
      message: 'Project created with ' + savedTasks.length + ' tasks',
    });
  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.userId }).sort('-createdAt');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const tasks = await Task.find({ project: project._id }).sort('day');
    res.json({ project, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rescheduleProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const daysLeft = Math.ceil(
      (new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );
    const remaining = await Task.find({
      project: project._id,
      status:  { $in: ['pending', 'partial'] },
    });
    if (!remaining.length) {
      return res.json({ message: 'No remaining tasks to reschedule' });
    }
    console.log('Rescheduling ' + remaining.length + ' tasks across ' + daysLeft + ' days...');
    const newSchedule = await rescheduleProject({
      name:           project.name,
      remainingTasks: remaining.map(function(t) {
        return { id: t._id, title: t.title, estimatedH: t.estimatedH, priority: t.priority };
      }),
      daysLeft:    daysLeft,
      hoursPerDay: project.hoursPerDay,
    });
    for (const t of newSchedule) {
      await Task.findByIdAndUpdate(t.id, { day: t.day });
    }
    await Project.findByIdAndUpdate(req.params.id, { status: 'on-track', daysBehind: 0 });
    const tasks = await Task.find({ project: project._id }).sort('day');
    res.json({ message: 'Rescheduled successfully', tasks: tasks });
  } catch (err) {
    console.error('RESCHEDULE ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id }).sort('day');
    if (!tasks.length) return res.json([]);
    const totalTasks = tasks.length;
    const project    = await Project.findById(req.params.id);
    const createdAt  = new Date(project.createdAt);
    const today      = new Date();
    const dayNumber  = Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24));
    const data = [];
    for (let d = 1; d <= Math.max(dayNumber, 1); d++) {
      const plannedByDay = tasks.filter(function(t) { return t.day <= d; }).length;
      const doneByDay    = tasks.filter(function(t) { return t.day <= d && t.status === 'done'; }).length;
      data.push({
        day:     d,
        planned: Math.round((plannedByDay / totalTasks) * 100),
        actual:  Math.round((doneByDay    / totalTasks) * 100),
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
