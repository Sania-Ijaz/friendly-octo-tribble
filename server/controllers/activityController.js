const Activity = require('../models/Activity');

const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find();
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const filterActivities = async (req, res) => {
  try {
    const { type, tag, name } = req.query;
    const filter = {};
    if (type) filter.types = type;
    if (tag) filter.tags = tag;
    if (name) filter.name = { $regex: name, $options: 'i' };
    const activities = await Activity.find(filter);
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.status(200).json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActivityDetails = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('tasks')
      .populate('inputs')
      .populate('outcomes')
      .populate('linkedResources')
      .populate('linkedPeople')
      .populate('events');
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.status(200).json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createActivity = async (req, res) => {
  try {
    const activity = new Activity(req.body);
    const saved = await activity.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.status(200).json(activity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.status(200).json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getActivities,
  filterActivities,
  getActivityById,
  getActivityDetails,
  createActivity,
  updateActivity,
  deleteActivity,
};
