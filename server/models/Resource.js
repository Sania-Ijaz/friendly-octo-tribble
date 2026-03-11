const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cost: { type: Number },
    usageMetrics: {
      timesUsed: { type: Number, default: 0 },
      hoursUsed: { type: Number, default: 0 },
    },
    linkedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    linkedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
