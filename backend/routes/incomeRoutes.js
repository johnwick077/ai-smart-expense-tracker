const express = require('express');
const { body } = require('express-validator');
const {
  getIncome,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome
} = require('../controllers/incomeController');
const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', getIncome);

router.post(
  '/',
  [
    body('source').trim().notEmpty().withMessage('Income source is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    validate
  ],
  createIncome
);

router.get('/:id', getIncomeById);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
