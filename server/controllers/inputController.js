const Input = require('../models/Input');

const getInputs = async (req, res) => {
  try {
    const inputs = await Input.find();
    res.status(200).json(inputs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInputById = async (req, res) => {
  try {
    const input = await Input.findById(req.params.id);
    if (!input) return res.status(404).json({ message: 'Input not found' });
    res.status(200).json(input);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createInput = async (req, res) => {
  try {
    const input = new Input(req.body);
    const saved = await input.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateInput = async (req, res) => {
  try {
    const input = await Input.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!input) return res.status(404).json({ message: 'Input not found' });
    res.status(200).json(input);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteInput = async (req, res) => {
  try {
    const input = await Input.findByIdAndDelete(req.params.id);
    if (!input) return res.status(404).json({ message: 'Input not found' });
    res.status(200).json({ message: 'Input deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getInputs, getInputById, createInput, updateInput, deleteInput };
