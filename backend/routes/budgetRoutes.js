const express = require('express');
const { body } = require('express-validator');
const { getBudgets, setBudget, deleteBudget } = require('../controllers/budgetController');
const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', getBudgets);

router.post(
  '/',
  [
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Budget amount must be at least 1'),
    validate
  ],
  setBudget
);

router.delete('/:id', deleteBudget);

module.exports = router;
