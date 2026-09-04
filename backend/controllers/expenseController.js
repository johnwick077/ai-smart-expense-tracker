const Expense = require('../models/Expense');

// @desc    Get all user expenses with filtering & pagination
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search, paymentMethod, page = 1, limit = 50 } = req.query;

    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { merchant: searchRegex }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new manual expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, merchant, paymentMethod, date } = req.body;

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount: parseFloat(amount),
      category: category || 'Other',
      description,
      merchant: merchant || title,
      paymentMethod: paymentMethod || 'Other',
      date: date ? new Date(date) : new Date(),
      isImported: false
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully.',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense by ID
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    const updates = req.body;
    if (updates.amount) updates.amount = parseFloat(updates.amount);
    if (updates.date) updates.date = new Date(updates.date);

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully.',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense by ID
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense summary analytics
// @route   GET /api/expenses/summary
// @access  Private
const getExpenseSummary = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      transactionCount: expenses.length,
      categoryBreakdown
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
};
