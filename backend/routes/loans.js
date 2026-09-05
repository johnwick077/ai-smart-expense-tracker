const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  getLoans,
  createLoan,
  updateLoan,
  recordPayment,
  deleteLoan
} = require('../controllers/loanController');

// All loan routes are private
router.use(requireAuth);

router.route('/')
  .get(getLoans)
  .post(createLoan);

router.route('/:id')
  .put(updateLoan)
  .delete(deleteLoan);

router.post('/:id/payment', recordPayment);

module.exports = router;
