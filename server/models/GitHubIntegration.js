const mongoose = require('mongoose');

/**
 * GitHub Integration Model
 * Stores GitHub OAuth tokens and repository links
 */
const GitHubIntegrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },

  // GitHub OAuth
  githubUserId: {
    type: String,
    required: true
  },

  githubUsername: {
    type: String,
    required: true
  },

  accessToken: {
    type: String,
    required: true
  },

  refreshToken: String,

  tokenExpiresAt: Date,

  // Repository Info
  repoOwner: {
    type: String,
    required: true
  },

  repoName: {
    type: String,
    required: true
  },

  repoFullName: {
    type: String,
    required: true
  },

  repoUrl: String,

  defaultBranch: {
    type: String,
    default: 'main'
  },

  // Tracking Configuration
  trackedBranches: [{
    type: String
  }],

  // Webhook
  webhookId: String,
  webhookSecret: String,

  // Sync Status
  lastSyncAt: Date,
  lastCommitSha: String,
  lastCommitDate: Date,

  syncEnabled: {
    type: Boolean,
    default: true
  },

  // Statistics
  totalCommits: {
    type: Number,
    default: 0
  },

  totalPullRequests: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
GitHubIntegrationSchema.index({ user: 1, project: 1 });
GitHubIntegrationSchema.index({ githubUserId: 1 });
GitHubIntegrationSchema.index({ repoFullName: 1 });

// Update timestamp on save
GitHubIntegrationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GitHubIntegration', GitHubIntegrationSchema);
