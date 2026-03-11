const express = require('express');
const router = express.Router();
const {
  getAccounts,
  filterAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountController');

router.get('/filter', filterAccounts);
router.get('/', getAccounts);
router.get('/:id', getAccountById);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
