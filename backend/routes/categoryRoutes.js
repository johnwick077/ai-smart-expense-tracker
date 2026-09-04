const express = require('express');
const { body } = require('express-validator');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', getCategories);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    validate
  ],
  createCategory
);

module.exports = router;
