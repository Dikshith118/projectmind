const teamService = require('../services/teamCollaborationService');
const Project = require('../models/Project');
const Task = require('../models/Task');

/**
 * TEAM COLLABORATION CONTROLLER
 * 
 * Handles team member management and collaborative features
 */

/**
 * Invite team member
 */
exports.inviteMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }
    
    // Verify user has permission to invite
    const hasPermission = await teamService.hasPermission(
      projectId,
      req.user.userId,
      'canInviteMembers'
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to invite members' });
    }
    
    const invitation = await teamService.createInvitation(
      projectId,
      email,
      role,
      req.user.userId
    );
    
    // Broadcast to connected clients
    if (req.io) {
      req.io.to(`project:${projectId}`).emit('member:invited', {
        projectId,
        email,
        role,
        invitedBy: req.user.userId
      });
    }
    
    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation
    });
  } catch (error) {
    console.error('INVITE MEMBER ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Accept invitation
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    
    const project = await teamService.acceptInvitation(token, req.user.userId);
    
    // Broadcast to connected clients
    if (req.io) {
      req.io.to(`project:${project._id}`).emit('member:joined', {
        projectId: project._id,
        userId: req.user.userId
      });
    }
    
    res.json({
      message: 'Invitation accepted successfully',
      project
    });
  } catch (error) {
    console.error('ACCEPT INVITATION ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get project members
 */
exports.getMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verify access
    const hasAccess = await teamService.hasAccess(projectId, req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const members = await teamService.getProjectMembers(projectId);
    
    res.json(members);
  } catch (error) {
    console.error('GET MEMBERS ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove team member
 */
exports.removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    
    // Verify permission
    const hasPermission = await teamService.hasPermission(
      projectId,
      req.user.userId,
      'canInviteMembers'
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to remove members' });
    }
    
    await teamService.removeMember(projectId, userId, req.user.userId);
    
    // Broadcast to connected clients
    if (req.io) {
      req.io.to(`project:${projectId}`).emit('member:removed', {
        projectId,
        userId
      });
    }
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('REMOVE MEMBER ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update member role
 */
exports.updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    // Verify permission
    const hasPermission = await teamService.hasPermission(
      projectId,
      req.user.userId,
      'canInviteMembers'
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to update roles' });
    }
    
    const member = await teamService.updateMemberRole(projectId, userId, role);
    
    // Broadcast to connected clients
    if (req.io) {
      req.io.to(`project:${projectId}`).emit('member:role_updated', {
        projectId,
        userId,
        role
      });
    }
    
    res.json({
      message: 'Role updated successfully',
      member
    });
  } catch (error) {
    console.error('UPDATE ROLE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get team analytics
 */
exports.getTeamAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verify access
    const hasAccess = await teamService.hasAccess(projectId, req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const analytics = await teamService.getTeamAnalytics(projectId);
    
    res.json(analytics);
  } catch (error) {
    console.error('GET TEAM ANALYTICS ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get project activity feed
 */
exports.getActivityFeed = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 100 } = req.query;
    
    // Verify access
    const hasAccess = await teamService.hasAccess(projectId, req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const activities = await teamService.getProjectActivity(projectId, parseInt(limit));
    
    res.json(activities);
  } catch (error) {
    console.error('GET ACTIVITY FEED ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Assign task to member
 */
exports.assignTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds array is required' });
    }
    
    // Verify permission
    const hasPermission = await teamService.hasPermission(
      projectId,
      req.user.userId,
      'canEditTasks'
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to assign tasks' });
    }
    
    // Update task
    const task = await Task.findByIdAndUpdate(
      taskId,
      { 
        assignedTo: userIds,
        lastModifiedBy: req.user.userId
      },
      { new: true }
    ).populate('assignedTo', 'name email');
    
    // Log activity
    await teamService.logTaskActivity(
      taskId,
      projectId,
      req.user.userId,
      'assigned',
      { newValue: userIds }
    );
    
    // Broadcast to connected clients
    if (req.io) {
      req.io.to(`project:${projectId}`).emit('task:assigned', {
        projectId,
        taskId,
        assignedTo: userIds
      });
    }
    
    res.json({
      message: 'Task assigned successfully',
      task
    });
  } catch (error) {
    console.error('ASSIGN TASK ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search users
 */
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const users = await teamService.searchUsers(q);
    
    res.json(users);
  } catch (error) {
    console.error('SEARCH USERS ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's role in project
 */
exports.getUserRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const role = await teamService.getUserRole(projectId, req.user.userId);
    
    if (!role) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ role });
  } catch (error) {
    console.error('GET USER ROLE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};
