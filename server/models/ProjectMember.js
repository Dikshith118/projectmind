const mongoose = require('mongoose');

/**
 * PROJECT MEMBER MODEL
 * 
 * Tracks team members in collaborative projects
 */
const projectMemberSchema = new mongoose.Schema({
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'developer', 'viewer'], 
    default: 'developer' 
  },
  joinedAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'removed'], 
    default: 'active' 
  },
  invitedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  permissions: {
    canEditTasks: { type: Boolean, default: true },
    canDeleteTasks: { type: Boolean, default: false },
    canInviteMembers: { type: Boolean, default: false },
    canManageProject: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Compound index to prevent duplicate memberships
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

// Index for quick member lookups
projectMemberSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);
