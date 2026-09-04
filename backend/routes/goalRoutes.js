const express = require('express');
const { body } = require('express-validator');
const {
  getGoals,
  createGoal,
  addDeposit,
  updateGoal,
  deleteGoal
} = require('../controllers/goalController');
const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', getGoals);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Goal title is required'),
    body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be at least 1'),
    validate
  ],
  createGoal
);

router.post('/:id/deposit', addDeposit);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
