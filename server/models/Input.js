const mongoose = require('mongoose');

const inputSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['time', 'money', 'effort', 'materials', 'data', 'custom'],
      default: 'custom',
    },
    value: { type: Number, required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Input', inputSchema);
