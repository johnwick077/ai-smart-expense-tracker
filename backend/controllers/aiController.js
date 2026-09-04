const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const {
  categorizeBatch,
  generateSpendingAnalysis,
  generateMonthlySummary,
  generateBudgetRecommendations,
  handleChatAssistant
} = require('../services/aiService');

// @desc    Categorize an array of raw transactions
// @route   POST /api/ai/categorize
// @access  Private
const categorize = async (req, res, next) => {
  try {
    const { transactions } = req.body;
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ success: false, message: 'Please provide an array of transactions to categorize.' });
    }

    const categorized = await categorizeBatch(transactions);

    res.status(200).json({
      success: true,
      count: categorized.length,
      data: categorized
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI spending analysis
// @route   POST /api/ai/analyze
// @access  Private
const analyzeSpending = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    const incomes = await Income.find({ userId: req.user._id });

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const analysisText = await generateSpendingAnalysis(expenses, totalIncome);

    res.status(200).json({
      success: true,
      data: {
        analysis: analysisText,
        totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
        totalIncome
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate monthly financial report
// @route   POST /api/ai/monthly-summary
// @access  Private
const monthlySummary = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.body.month, 10) || (now.getMonth() + 1);
    const year = parseInt(req.body.year, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const income = await Income.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const summaryText = await generateMonthlySummary(month, year, expenses, income);

    res.status(200).json({
      success: true,
      month,
      year,
      data: {
        summary: summaryText,
        expenseCount: expenses.length,
        incomeCount: income.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate recommended monthly budget
// @route   POST /api/ai/budget
// @access  Private
const recommendBudget = async (req, res, next) => {
  try {
    // Calculate average monthly income
    const incomes = await Income.find({ userId: req.user._id });
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const monthlyIncome = totalIncome > 0 ? Math.round(totalIncome / Math.max(1, incomes.length / 2)) : 40000;

    const expenses = await Expense.find({ userId: req.user._id });
    const recommendations = await generateBudgetRecommendations(monthlyIncome, expenses);

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate actionable saving suggestions
// @route   POST /api/ai/suggestions
// @access  Private
const savingSuggestions = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    const foodExpenses = expenses.filter(e => e.category === 'Food').reduce((s, e) => s + e.amount, 0);
    const shoppingExpenses = expenses.filter(e => e.category === 'Shopping').reduce((s, e) => s + e.amount, 0);

    const suggestions = [
      {
        category: 'Food',
        spent: foodExpenses,
        potentialSavings: Math.round(foodExpenses * 0.20),
        tip: `You spent ₹${foodExpenses.toLocaleString('en-IN')} on food. Reducing food deliveries by approximately 20% could help you save around ₹${Math.round(foodExpenses * 0.20).toLocaleString('en-IN')} this month.`
      },
      {
        category: 'Shopping',
        spent: shoppingExpenses,
        potentialSavings: Math.round(shoppingExpenses * 0.15),
        tip: `Shopping expenses totaled ₹${shoppingExpenses.toLocaleString('en-IN')}. Implementing a 48-hour pause before impulse purchases could conserve approx ₹${Math.round(shoppingExpenses * 0.15).toLocaleString('en-IN')}.`
      }
    ];

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Private, user-isolated conversational financial assistant
// @route   POST /api/ai/chat
// @access  Private
const chatAssistant = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid query string.' });
    }

    // Strictly fetch ONLY the authenticated user's records
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    const income = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    const budgets = await Budget.find({ userId: req.user._id });

    const reply = await handleChatAssistant(req.user, expenses, income, budgets, query);

    res.status(200).json({
      success: true,
      query,
      data: {
        reply
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  categorize,
  analyzeSpending,
  monthlySummary,
  recommendBudget,
  savingSuggestions,
  chatAssistant
};
