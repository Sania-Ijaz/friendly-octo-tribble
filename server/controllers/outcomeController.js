const Outcome = require('../models/Outcome');

const getOutcomes = async (req, res) => {
  try {
    const outcomes = await Outcome.find();
    res.status(200).json(outcomes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOutcomeById = async (req, res) => {
  try {
    const outcome = await Outcome.findById(req.params.id);
    if (!outcome) return res.status(404).json({ message: 'Outcome not found' });
    res.status(200).json(outcome);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createOutcome = async (req, res) => {
  try {
    const outcome = new Outcome(req.body);
    const saved = await outcome.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateOutcome = async (req, res) => {
  try {
    const outcome = await Outcome.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!outcome) return res.status(404).json({ message: 'Outcome not found' });
    res.status(200).json(outcome);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteOutcome = async (req, res) => {
  try {
    const outcome = await Outcome.findByIdAndDelete(req.params.id);
    if (!outcome) return res.status(404).json({ message: 'Outcome not found' });
    res.status(200).json({ message: 'Outcome deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getOutcomes, getOutcomeById, createOutcome, updateOutcome, deleteOutcome };
