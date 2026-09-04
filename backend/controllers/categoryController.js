const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Food', type: 'expense', color: '#F59E0B', icon: 'Utensils' },
  { name: 'Hotel', type: 'expense', color: '#8B5CF6', icon: 'Hotel' },
  { name: 'Shopping', type: 'expense', color: '#EC4899', icon: 'ShoppingBag' },
  { name: 'Transport', type: 'expense', color: '#06B6D4', icon: 'Car' },
  { name: 'Bills', type: 'expense', color: '#3B82F6', icon: 'Receipt' },
  { name: 'Entertainment', type: 'expense', color: '#F97316', icon: 'Film' },
  { name: 'Healthcare', type: 'expense', color: '#10B981', icon: 'HeartPulse' },
  { name: 'Education', type: 'expense', color: '#6366F1', icon: 'GraduationCap' },
  { name: 'Rent', type: 'expense', color: '#14B8A6', icon: 'Home' },
  { name: 'Travel', type: 'expense', color: '#0EA5E9', icon: 'Plane' },
  { name: 'Salary', type: 'income', color: '#22C55E', icon: 'Briefcase' },
  { name: 'Other', type: 'both', color: '#6B7280', icon: 'Tag' }
];

// @desc    Get all categories (defaults + user custom)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      $or: [
        { isDefault: true },
        { createdBy: req.user ? req.user._id : null }
      ]
    }).sort({ name: 1 });

    if (categories.length === 0) {
      // Auto seed if empty
      await Category.insertMany(DEFAULT_CATEGORIES);
      const seeded = await Category.find();
      return res.status(200).json({ success: true, count: seeded.length, data: seeded });
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new custom category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name, type = 'expense', color = '#6B7280', icon = 'Tag' } = req.body;

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists.' });
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      color,
      icon,
      isDefault: false,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  DEFAULT_CATEGORIES
};
