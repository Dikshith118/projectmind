const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true },
  goal:        { type: String, required: true },
  deadline:    { type: Date, required: true },
  hoursPerDay: { type: Number, required: true },
  status:      { type: String, enum: ['on-track', 'delayed', 'completed'], default: 'on-track' },
  daysBehind:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);