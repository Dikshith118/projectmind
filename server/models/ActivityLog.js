const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  project:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  file:      { type: String, required: true },
  event:     { type: String, enum: ['edit', 'save', 'open', 'commit'], required: true },
  duration:  { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);