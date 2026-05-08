const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * TEAM INVITATION MODEL
 * 
 * Manages project invitations sent to team members
 */
const teamInvitationSchema = new mongoose.Schema({
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true 
  },
  invitedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'developer', 'viewer'], 
    default: 'developer' 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'], 
    default: 'pending' 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  acceptedAt: Date,
  acceptedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Generate unique invitation token
teamInvitationSchema.pre('save', function(next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  if (!this.expiresAt) {
    // Invitations expire in 7 days
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Index for quick lookups
teamInvitationSchema.index({ token: 1 });
teamInvitationSchema.index({ email: 1, project: 1 });
teamInvitationSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('TeamInvitation', teamInvitationSchema);
