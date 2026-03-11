const express = require('express');
const router = express.Router();
const {
  getInputs,
  getInputById,
  createInput,
  updateInput,
  deleteInput,
} = require('../controllers/inputController');

router.get('/', getInputs);
router.get('/:id', getInputById);
router.post('/', createInput);
router.put('/:id', updateInput);
router.delete('/:id', deleteInput);

module.exports = router;
