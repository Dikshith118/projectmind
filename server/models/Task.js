const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project:         { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  day:             { type: Number, required: true },
  title:           { type: String, required: true },
  description:     { type: String },
  status:          { type: String, enum: ['pending', 'partial', 'done', 'skipped'], default: 'pending' },
  estimatedH:      { type: Number, default: 1 },
  priority:        { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  dependencies:    [{ type: String }],
  activityMinutes: { type: Number, default: 0 },
  
  // Collaborative features
  assignedTo:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt:     { type: Date },
  
  // Attachments and links
  attachments:     [{
    name: String,
    url: String,
    type: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  commits:         [{
    hash: String,
    message: String,
    url: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date
  }]
}, { timestamps: true });

// Index for efficient queries
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Task', taskSchema);