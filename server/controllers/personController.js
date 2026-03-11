const Person = require('../models/Person');

const getPeople = async (req, res) => {
  try {
    const people = await Person.find();
    res.status(200).json(people);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPersonById = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).json({ message: 'Person not found' });
    res.status(200).json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPerson = async (req, res) => {
  try {
    const person = new Person(req.body);
    const saved = await person.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updatePerson = async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!person) return res.status(404).json({ message: 'Person not found' });
    res.status(200).json(person);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePerson = async (req, res) => {
  try {
    const person = await Person.findByIdAndDelete(req.params.id);
    if (!person) return res.status(404).json({ message: 'Person not found' });
    res.status(200).json({ message: 'Person deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPeople, getPersonById, createPerson, updatePerson, deletePerson };
