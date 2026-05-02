const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project:         { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  day:             { type: Number, required: true },
  title:           { type: String, required: true },
  status:          { type: String, enum: ['pending', 'partial', 'done', 'skipped'], default: 'pending' },
  estimatedH:      { type: Number, default: 1 },
  priority:        { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  dependencies:    [{ type: String }],
  activityMinutes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);