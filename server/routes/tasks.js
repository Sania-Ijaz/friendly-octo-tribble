const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskProgress,
  deleteTask,
} = require('../controllers/taskController');

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id/progress', updateTaskProgress);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
