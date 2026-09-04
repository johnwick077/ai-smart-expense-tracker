const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get all savings goals with progress tracking
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const enrichedGoals = goals.map(g => {
      const percentage = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100).toFixed(1) : 0;
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);

      return {
        id: g._id,
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        remaining,
        percentage: parseFloat(percentage),
        deadline: g.deadline,
        description: g.description,
        status: g.status,
        createdAt: g.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: enrichedGoals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new savings goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount = 0, deadline, description } = req.body;

    const goal = await SavingsGoal.create({
      userId: req.user._id,
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline: deadline ? new Date(deadline) : null,
      description,
      status: parseFloat(currentAmount) >= parseFloat(targetAmount) ? 'completed' : 'in_progress'
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully.',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add deposit to savings goal
// @route   POST /api/goals/:id/deposit
// @access  Private
const addDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid positive deposit amount.' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found.' });
    }

    goal.currentAmount += depositAmount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: `Successfully deposited ₹${depositAmount}. New total: ₹${goal.currentAmount}`,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update savings goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    let goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found.' });
    }

    const updates = req.body;
    if (updates.targetAmount) updates.targetAmount = parseFloat(updates.targetAmount);
    if (updates.currentAmount) updates.currentAmount = parseFloat(updates.currentAmount);

    goal = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully.',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  addDeposit,
  updateGoal,
  deleteGoal
};
