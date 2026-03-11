const mongoose = require('mongoose');

const outcomeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    linkedInputs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Input' }],
    linkedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    date: { type: Date, default: Date.now },
    frequency: { type: String, enum: ['daily', 'long-term'], default: 'daily' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Outcome', outcomeSchema);
