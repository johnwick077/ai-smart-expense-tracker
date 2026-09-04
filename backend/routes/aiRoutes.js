const express = require('express');
const { body } = require('express-validator');
const {
  categorize,
  analyzeSpending,
  monthlySummary,
  recommendBudget,
  savingSuggestions,
  chatAssistant
} = require('../controllers/aiController');
const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.post('/categorize', categorize);
router.post('/analyze', analyzeSpending);
router.post('/monthly-summary', monthlySummary);
router.post('/budget', recommendBudget);
router.post('/suggestions', savingSuggestions);

router.post(
  '/chat',
  [
    body('query').trim().notEmpty().withMessage('Query is required'),
    validate
  ],
  chatAssistant
);

module.exports = router;
