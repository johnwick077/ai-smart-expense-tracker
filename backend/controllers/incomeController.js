const Income = require('../models/Income');

// @desc    Get all user income streams
// @route   GET /api/income
// @access  Private
const getIncome = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Income.countDocuments(query);
    const incomes = await Income.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: incomes.length,
      total,
      data: incomes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single income by ID
// @route   GET /api/income/:id
// @access  Private
const getIncomeById = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found.' });
    }
    res.status(200).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new income
// @route   POST /api/income
// @access  Private
const createIncome = async (req, res, next) => {
  try {
    const { source, amount, description, date } = req.body;

    const income = await Income.create({
      userId: req.user._id,
      source,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
      isImported: false
    });

    res.status(201).json({
      success: true,
      message: 'Income record created successfully.',
      data: income
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income by ID
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res, next) => {
  try {
    let income = await Income.findOne({ _id: req.params.id, userId: req.user._id });
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found.' });
    }

    const updates = req.body;
    if (updates.amount) updates.amount = parseFloat(updates.amount);
    if (updates.date) updates.date = new Date(updates.date);

    income = await Income.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Income record updated successfully.',
      data: income
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income by ID
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Income record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncome,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome
};
