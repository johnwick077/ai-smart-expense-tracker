const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get user budgets with current spending comparison
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year
    });

    // Calculate actual spending in this month/year for each category
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const monthExpenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const categorySpending = {};
    monthExpenses.forEach(e => {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
    });

    let totalBudget = 0;
    let totalSpent = 0;

    const enrichedBudgets = budgets.map(b => {
      const spent = categorySpending[b.category] || 0;
      const remaining = b.amount - spent;
      const percentage = b.amount > 0 ? ((spent / b.amount) * 100).toFixed(1) : 0;
      
      let status = 'Safe';
      if (percentage >= 100) status = 'Exceeded';
      else if (percentage >= 85) status = 'Warning';

      totalBudget += b.amount;
      totalSpent += spent;

      return {
        id: b._id,
        category: b.category,
        amount: b.amount,
        spent,
        remaining,
        percentage: parseFloat(percentage),
        status,
        month: b.month,
        year: b.year
      };
    });

    res.status(200).json({
      success: true,
      month,
      year,
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      data: enrichedBudgets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update monthly budget for a category
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;
    const now = new Date();

    const targetMonth = parseInt(month, 10) || (now.getMonth() + 1);
    const targetYear = parseInt(year, 10) || now.getFullYear();

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user._id,
        category,
        month: targetMonth,
        year: targetYear
      },
      {
        $set: {
          amount: parseFloat(amount)
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Budget set successfully.',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget by ID
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget
};
