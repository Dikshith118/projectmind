const mongoose = require('mongoose');

/**
 * GitHub Commit Model
 * Stores commit data for analysis and task correlation
 */
const GitHubCommitSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },

  integration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GitHubIntegration',
    required: true
  },

  // Commit Info
  sha: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  message: {
    type: String,
    required: true
  },

  author: {
    name: String,
    email: String,
    username: String,
    avatarUrl: String
  },

  committedAt: {
    type: Date,
    required: true,
    index: true
  },

  // Branch Info
  branch: String,

  // Commit Details
  additions: {
    type: Number,
    default: 0
  },

  deletions: {
    type: Number,
    default: 0
  },

  totalChanges: {
    type: Number,
    default: 0
  },

  filesChanged: [{
    filename: String,
    status: String, // added, modified, removed
    additions: Number,
    deletions: Number,
    changes: Number
  }],

  // AI Analysis
  aiAnalysis: {
    inferredTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },

    category: {
      type: String,
      enum: ['feature', 'bugfix', 'refactor', 'test', 'docs', 'style', 'chore', 'unknown'],
      default: 'unknown'
    },

    keywords: [String],

    completionIndicators: {
      hasTests: Boolean,
      hasDocs: Boolean,
      isComplete: Boolean
    },

    analyzedAt: Date
  },

  // Task Correlation
  correlatedTasks: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    confidence: Number,
    reason: String
  }],

  // Pull Request
  pullRequest: {
    number: Number,
    title: String,
    state: String,
    url: String
  },

  // Metadata
  url: String,
  htmlUrl: String,

  processed: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
GitHubCommitSchema.index({ project: 1, committedAt: -1 });
GitHubCommitSchema.index({ 'aiAnalysis.inferredTask': 1 });
GitHubCommitSchema.index({ processed: 1 });

module.exports = mongoose.model('GitHubCommit', GitHubCommitSchema);
