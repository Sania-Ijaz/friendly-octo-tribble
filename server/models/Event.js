const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    activityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    inputIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Input' }],
    taskProgress: { type: Map, of: Number },
    outcomeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Outcome' }],
    resourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
    peopleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    financialImpact: {
      accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'FinancialAccount' },
      amount: { type: Number },
      type: { type: String, enum: ['spent', 'earned'] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
