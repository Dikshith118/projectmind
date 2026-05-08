const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Project owner
  name:        { type: String, required: true },
  goal:        { type: String, required: true },
  deadline:    { type: Date, required: true },
  hoursPerDay: { type: Number, required: true },
  status:      { type: String, enum: ['on-track', 'delayed', 'completed'], default: 'on-track' },
  daysBehind:  { type: Number, default: 0 },
  
  // Collaborative features
  isCollaborative: { type: Boolean, default: false },
  teamSize:        { type: Number, default: 1 },
  visibility:      { type: String, enum: ['private', 'team'], default: 'private' }
}, { timestamps: true });

// Index for efficient queries
projectSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);