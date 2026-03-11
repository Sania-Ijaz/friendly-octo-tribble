const FinancialAccount = require('../models/FinancialAccount');

const getAccounts = async (req, res) => {
  try {
    const accounts = await FinancialAccount.find();
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const filterAccounts = async (req, res) => {
  try {
    const { type, minBalance, maxBalance } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (minBalance !== undefined || maxBalance !== undefined) {
      filter.balance = {};
      if (minBalance !== undefined) filter.balance.$gte = Number(minBalance);
      if (maxBalance !== undefined) filter.balance.$lte = Number(maxBalance);
    }
    const accounts = await FinancialAccount.find(filter);
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAccountById = async (req, res) => {
  try {
    const account = await FinancialAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const account = new FinancialAccount(req.body);
    const saved = await account.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateAccount = async (req, res) => {
  try {
    const account = await FinancialAccount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.status(200).json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const account = await FinancialAccount.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.status(200).json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAccounts,
  filterAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};
