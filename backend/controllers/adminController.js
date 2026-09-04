const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const ImportHistory = require('../models/ImportHistory');

// @desc    Get system-wide platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalExpensesCount = await Expense.countDocuments();
    const totalIncomeCount = await Income.countDocuments();
    const totalImportsCount = await ImportHistory.countDocuments();

    // Aggregations
    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
    ]);
    const incomeAgg = await Income.aggregate([
      { $group: { _id: null, totalInflow: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalExpensesCount,
        totalIncomeCount,
        totalImportsCount,
        platformVolumeSpent: expenseAgg[0]?.totalSpent || 0,
        platformVolumeInflow: incomeAgg[0]?.totalInflow || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.status = status;
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/deactivated status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'deactivated', 'banned'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}.`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and cascade data
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Cascade delete associated data
    await Expense.deleteMany({ userId: req.params.id });
    await Income.deleteMany({ userId: req.params.id });
    await ImportHistory.deleteMany({ userId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User and all associated financial records permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getUsers,
  toggleUserStatus,
  deleteUser
};
