const ProjectMember = require('../models/ProjectMember');
const TeamInvitation = require('../models/TeamInvitation');
const TaskActivity = require('../models/TaskActivity');
const User = require('../models/User');
const Project = require('../models/Project');

/**
 * TEAM COLLABORATION SERVICE
 * 
 * Manages team members, invitations, and collaborative features
 */
class TeamCollaborationService {
  
  /**
   * Add team member to project
   */
  async addMember(projectId, userId, role, invitedBy) {
    const member = await ProjectMember.create({
      project: projectId,
      user: userId,
      role,
      invitedBy,
      permissions: this._getRolePermissions(role)
    });
    
    // Update project team size
    await this._updateTeamSize(projectId);
    
    return member;
  }

  /**
   * Get role-based permissions
   */
  _getRolePermissions(role) {
    const permissions = {
      owner: {
        canEditTasks: true,
        canDeleteTasks: true,
        canInviteMembers: true,
        canManageProject: true
      },
      admin: {
        canEditTasks: true,
        canDeleteTasks: true,
        canInviteMembers: true,
        canManageProject: false
      },
      developer: {
        canEditTasks: true,
        canDeleteTasks: false,
        canInviteMembers: false,
        canManageProject: false
      },
      viewer: {
        canEditTasks: false,
        canDeleteTasks: false,
        canInviteMembers: false,
        canManageProject: false
      }
    };
    
    return permissions[role] || permissions.viewer;
  }

  /**
   * Create invitation for new team member
   */
  async createInvitation(projectId, email, role, invitedBy) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    // Check if already a member
    if (existingUser) {
      const existingMember = await ProjectMember.findOne({
        project: projectId,
        user: existingUser._id,
        status: 'active'
      });
      
      if (existingMember) {
        throw new Error('User is already a team member');
      }
    }
    
    // Check for pending invitation
    const pendingInvitation = await TeamInvitation.findOne({
      project: projectId,
      email,
      status: 'pending'
    });
    
    if (pendingInvitation) {
      throw new Error('Invitation already sent to this email');
    }
    
    // Create invitation
    const invitation = await TeamInvitation.create({
      project: projectId,
      email,
      role,
      invitedBy
    });
    
    return invitation;
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(token, userId) {
    const invitation = await TeamInvitation.findOne({ token, status: 'pending' })
      .populate('project');
    
    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }
    
    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save();
      throw new Error('Invitation has expired');
    }
    
    // Verify user email matches invitation
    const user = await User.findById(userId);
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error('This invitation was sent to a different email address');
    }
    
    // Add user as project member
    await this.addMember(
      invitation.project._id,
      userId,
      invitation.role,
      invitation.invitedBy
    );
    
    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = userId;
    await invitation.save();
    
    return invitation.project;
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId) {
    const members = await ProjectMember.find({ 
      project: projectId, 
      status: 'active' 
    })
      .populate('user', 'name email')
      .populate('invitedBy', 'name email')
      .sort('-createdAt');
    
    return members;
  }

  /**
   * Get user's projects (including collaborative)
   */
  async getUserProjects(userId) {
    // Get projects where user is owner
    const ownedProjects = await Project.find({ user: userId });
    
    // Get projects where user is a member
    const memberships = await ProjectMember.find({ 
      user: userId, 
      status: 'active' 
    }).populate('project');
    
    const memberProjects = memberships
      .map(m => m.project)
      .filter(p => p && p.user.toString() !== userId.toString());
    
    // Combine and deduplicate
    const allProjects = [...ownedProjects, ...memberProjects];
    
    return allProjects;
  }

  /**
   * Check if user has access to project
   */
  async hasAccess(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) return false;
    
    // Owner always has access
    if (project.user.toString() === userId.toString()) {
      return true;
    }
    
    // Check membership
    const member = await ProjectMember.findOne({
      project: projectId,
      user: userId,
      status: 'active'
    });
    
    return !!member;
  }

  /**
   * Get user's role in project
   */
  async getUserRole(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) return null;
    
    // Owner has owner role
    if (project.user.toString() === userId.toString()) {
      return 'owner';
    }
    
    // Check membership
    const member = await ProjectMember.findOne({
      project: projectId,
      user: userId,
      status: 'active'
    });
    
    return member ? member.role : null;
  }

  /**
   * Check if user has permission
   */
  async hasPermission(projectId, userId, permission) {
    const role = await this.getUserRole(projectId, userId);
    if (!role) return false;
    
    const permissions = this._getRolePermissions(role);
    return permissions[permission] || false;
  }

  /**
   * Remove team member
   */
  async removeMember(projectId, userId, removedBy) {
    const member = await ProjectMember.findOne({
      project: projectId,
      user: userId,
      status: 'active'
    });
    
    if (!member) {
      throw new Error('Member not found');
    }
    
    // Cannot remove owner
    if (member.role === 'owner') {
      throw new Error('Cannot remove project owner');
    }
    
    member.status = 'removed';
    await member.save();
    
    // Update project team size
    await this._updateTeamSize(projectId);
    
    return member;
  }

  /**
   * Update member role
   */
  async updateMemberRole(projectId, userId, newRole) {
    const member = await ProjectMember.findOne({
      project: projectId,
      user: userId,
      status: 'active'
    });
    
    if (!member) {
      throw new Error('Member not found');
    }
    
    // Cannot change owner role
    if (member.role === 'owner') {
      throw new Error('Cannot change owner role');
    }
    
    member.role = newRole;
    member.permissions = this._getRolePermissions(newRole);
    await member.save();
    
    return member;
  }

  /**
   * Log task activity
   */
  async logTaskActivity(taskId, projectId, userId, action, details = {}) {
    const activity = await TaskActivity.create({
      task: taskId,
      project: projectId,
      user: userId,
      action,
      details
    });
    
    return activity;
  }

  /**
   * Get task activity history
   */
  async getTaskActivity(taskId, limit = 50) {
    const activities = await TaskActivity.find({ task: taskId })
      .populate('user', 'name email')
      .sort('-timestamp')
      .limit(limit);
    
    return activities;
  }

  /**
   * Get project activity feed
   */
  async getProjectActivity(projectId, limit = 100) {
    const activities = await TaskActivity.find({ project: projectId })
      .populate('user', 'name email')
      .populate('task', 'title')
      .sort('-timestamp')
      .limit(limit);
    
    return activities;
  }

  /**
   * Get team member statistics
   */
  async getMemberStats(projectId, userId) {
    const activities = await TaskActivity.find({
      project: projectId,
      user: userId
    });
    
    const stats = {
      totalActivities: activities.length,
      tasksCompleted: activities.filter(a => a.action === 'completed').length,
      tasksUpdated: activities.filter(a => a.action === 'updated').length,
      commentsAdded: activities.filter(a => a.action === 'commented').length,
      filesAttached: activities.filter(a => a.action === 'file_attached').length,
      commitsLinked: activities.filter(a => a.action === 'commit_linked').length
    };
    
    return stats;
  }

  /**
   * Get team analytics
   */
  async getTeamAnalytics(projectId) {
    const members = await this.getProjectMembers(projectId);
    const analytics = [];
    
    for (const member of members) {
      const stats = await this.getMemberStats(projectId, member.user._id);
      analytics.push({
        user: member.user,
        role: member.role,
        joinedAt: member.joinedAt,
        stats
      });
    }
    
    // Sort by contribution (tasks completed)
    analytics.sort((a, b) => b.stats.tasksCompleted - a.stats.tasksCompleted);
    
    return analytics;
  }

  /**
   * Update project team size
   */
  async _updateTeamSize(projectId) {
    const count = await ProjectMember.countDocuments({
      project: projectId,
      status: 'active'
    });
    
    await Project.findByIdAndUpdate(projectId, {
      teamSize: count + 1, // +1 for owner
      isCollaborative: count > 0
    });
  }

  /**
   * Search users by email
   */
  async searchUsers(query) {
    const users = await User.find({
      email: { $regex: query, $options: 'i' }
    })
      .select('name email')
      .limit(10);
    
    return users;
  }
}

module.exports = new TeamCollaborationService();
