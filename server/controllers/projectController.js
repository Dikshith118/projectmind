const Project     = require('../models/Project');
const Task        = require('../models/Task');
const TaskMapping = require('../models/TaskMapping');
const { breakdownProject, rescheduleProject } = require('../services/claudeService');
const { runDelayDetection } = require('../services/delayDetector');
const { extractTextFromFile, cleanupFile } = require('../services/fileParser');
const { buildIntelligentContext, combineContextForAI } = require('../services/contextBuilder');
const { generateEnhancedPlan } = require('../services/intelligentPlanner');

exports.createProject = async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    const { name, goal, deadline, hoursPerDay, teamMembers } = req.body;
    if (!name || !goal || !deadline || !hoursPerDay) {
      return res.status(400).json({ error: 'name, goal, deadline, hoursPerDay are required' });
    }

    // Handle uploaded document if present
    let documentContext = null;
    let combinedContext = goal;

    if (req.file) {
      uploadedFilePath = req.file.path;
      console.log('Processing uploaded document:', req.file.originalname);

      try {
        // Extract text from document
        const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
        console.log('Extracted text length:', extractedText.length);

        // Build intelligent context
        documentContext = buildIntelligentContext(extractedText);
        console.log('Detected technologies:', documentContext.detectedTechnologies.length);
        console.log('Detected features:', documentContext.detectedFeatures.length);

        // Combine project brief with document context
        combinedContext = combineContextForAI(goal, documentContext);
      } catch (parseError) {
        console.error('Document parsing error:', parseError.message);
        // Continue without document context if parsing fails
      } finally {
        // Cleanup uploaded file
        if (uploadedFilePath) {
          await cleanupFile(uploadedFilePath);
          uploadedFilePath = null;
        }
      }
    }

    // Parse team members if provided
    let parsedTeamMembers = [];
    if (teamMembers) {
      try {
        parsedTeamMembers = typeof teamMembers === 'string' 
          ? JSON.parse(teamMembers) 
          : teamMembers;
      } catch (e) {
        console.error('Failed to parse team members:', e.message);
      }
    }

    const project = await Project.create({
      user: req.user.userId,
      name,
      goal,
      deadline,
      hoursPerDay,
      isCollaborative: parsedTeamMembers.length > 0,
      teamSize: parsedTeamMembers.length + 1
    });
    
    console.log('Calling AI for enhanced task breakdown...');
    
    let tasks, mapping, insights;
    try {
      // Use enhanced planner with document context
      const result = await generateEnhancedPlan({
        name,
        combinedContext,
        deadline,
        hoursPerDay,
        documentContext
      });

      tasks = result.tasks;
      mapping = result.mapping || {};
      insights = result.insights || {};
      console.log('AI returned ' + tasks.length + ' tasks with insights');
    } catch (aiError) {
      console.error('AI breakdown failed:', aiError.message);
      console.log('Using fallback task generation...');
      
      // Fallback: Create basic tasks manually
      const daysLeft = Math.ceil(
        (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      const tasksPerPhase = Math.ceil(daysLeft / 3);
      
      tasks = [
        { 
          id: 't1', 
          day: 1, 
          title: 'Project setup and planning', 
          estimatedH: hoursPerDay, 
          priority: 'high', 
          dependencies: [] 
        },
        { 
          id: 't2', 
          day: tasksPerPhase, 
          title: 'Core implementation - Phase 1', 
          estimatedH: hoursPerDay, 
          priority: 'high', 
          dependencies: [] 
        },
        { 
          id: 't3', 
          day: tasksPerPhase * 2, 
          title: 'Core implementation - Phase 2', 
          estimatedH: hoursPerDay, 
          priority: 'high', 
          dependencies: [] 
        },
        { 
          id: 't4', 
          day: Math.max(daysLeft - 1, tasksPerPhase * 2 + 1), 
          title: 'Testing and bug fixes', 
          estimatedH: hoursPerDay, 
          priority: 'medium', 
          dependencies: [] 
        },
        { 
          id: 't5', 
          day: daysLeft, 
          title: 'Final review and deployment', 
          estimatedH: hoursPerDay, 
          priority: 'medium', 
          dependencies: [] 
        },
      ];
      mapping = {};
      insights = {};
    }
    
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
        createdBy:    req.user.userId
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

    // Add project owner as member
    const ProjectMember = require('../models/ProjectMember');
    await ProjectMember.create({
      project: project._id,
      user: req.user.userId,
      role: 'owner',
      invitedBy: req.user.userId
    });

    // Send invitations to team members
    if (parsedTeamMembers.length > 0) {
      const teamService = require('../services/teamCollaborationService');
      
      for (const member of parsedTeamMembers) {
        try {
          await teamService.createInvitation(
            project._id,
            member.email,
            member.role || 'developer',
            req.user.userId
          );
          console.log('Invitation sent to:', member.email);
        } catch (inviteError) {
          console.error('Failed to invite', member.email, ':', inviteError.message);
        }
      }
    }

    res.status(201).json({
      project,
      tasks:   savedTasks,
      insights: insights,
      message: 'Project created with ' + savedTasks.length + ' tasks',
    });
  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err.message);
    
    // Cleanup file on error
    if (uploadedFilePath) {
      await cleanupFile(uploadedFilePath);
    }
    
    res.status(500).json({ error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const teamService = require('../services/teamCollaborationService');
    const projects = await teamService.getUserProjects(req.user.userId);
    
    // Sort by creation date
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Verify access (owner or team member)
    const teamService = require('../services/teamCollaborationService');
    const hasAccess = await teamService.hasAccess(req.params.id, req.user.userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .sort('day');
    
    res.json({ project, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rescheduleProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Verify ownership
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
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
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Verify ownership
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const tasks = await Task.find({ project: req.params.id }).sort('day');
    if (!tasks.length) return res.json([]);
    const totalTasks = tasks.length;
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

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Verify ownership
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Delete all related tasks
    await Task.deleteMany({ project: req.params.id });
    
    // Delete all related task mappings
    await TaskMapping.deleteMany({ project: req.params.id });
    
    // Delete all related activity logs if they exist
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.deleteMany({ project: req.params.id });
    
    // Delete the project
    await Project.findByIdAndDelete(req.params.id);
    
    console.log('Project deleted:', req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('DELETE PROJECT ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};
