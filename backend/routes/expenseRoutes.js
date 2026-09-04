const express = require('express');
const { body } = require('express-validator');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expenseController');
const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// All expense routes require authentication
router.use(requireAuth);

router.get('/summary', getExpenseSummary);

router.get('/', getExpenses);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Expense title is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    validate
  ],
  createExpense
);

router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
