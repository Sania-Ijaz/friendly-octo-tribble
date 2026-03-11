const mongoose = require('mongoose');

const financialAccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['Bank', 'Wallet', 'Investment'], default: 'Bank' },
    balance: { type: Number, default: 0 },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinancialAccount', financialAccountSchema);
