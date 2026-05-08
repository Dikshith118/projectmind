const mongoose = require('mongoose');

/**
 * TASK ACTIVITY MODEL
 * 
 * Tracks all task-related activities by team members
 */
const taskActivitySchema = new mongoose.Schema({
  task: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task', 
    required: true 
  },
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
  action: { 
    type: String, 
    enum: [
      'created',
      'updated',
      'status_changed',
      'assigned',
      'unassigned',
      'commented',
      'completed',
      'reopened',
      'deleted',
      'file_attached',
      'commit_linked'
    ], 
    required: true 
  },
  details: {
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    comment: String,
    fileUrl: String,
    commitHash: String,
    commitUrl: String
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Indexes for efficient queries
taskActivitySchema.index({ task: 1, timestamp: -1 });
taskActivitySchema.index({ project: 1, timestamp: -1 });
taskActivitySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('TaskActivity', taskActivitySchema);
