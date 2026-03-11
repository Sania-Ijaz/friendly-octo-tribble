const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    types: [String],
    tags: [String],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    inputs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Input' }],
    outcomes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Outcome' }],
    linkedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
    linkedPeople: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
