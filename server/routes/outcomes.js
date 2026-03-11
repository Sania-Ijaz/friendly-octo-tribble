const express = require('express');
const router = express.Router();
const {
  getOutcomes,
  getOutcomeById,
  createOutcome,
  updateOutcome,
  deleteOutcome,
} = require('../controllers/outcomeController');

router.get('/', getOutcomes);
router.get('/:id', getOutcomeById);
router.post('/', createOutcome);
router.put('/:id', updateOutcome);
router.delete('/:id', deleteOutcome);

module.exports = router;
