const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    quantitativeProgress: { type: Number, default: 0 },
    unit: { type: String, default: 'units' },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
