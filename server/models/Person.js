const mongoose = require('mongoose');

const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: 'Other' },
    linkedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    linkedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Person', personSchema);
