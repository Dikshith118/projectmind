const mongoose = require('mongoose');

const taskMappingSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  taskId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  paths:   [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('TaskMapping', taskMappingSchema);