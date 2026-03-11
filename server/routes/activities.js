const express = require('express');
const router = express.Router();
const {
  getActivities,
  filterActivities,
  getActivityById,
  getActivityDetails,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activityController');

router.get('/filter', filterActivities);
router.get('/:id/details', getActivityDetails);
router.get('/', getActivities);
router.get('/:id', getActivityById);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
