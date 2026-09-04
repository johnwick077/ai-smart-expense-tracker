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

// @desc    Export professional 7-sheet Excel financial report
// @route   GET /api/expenses/export-excel
// @access  Private
const exportExcelDashboard = async (req, res, next) => {
  try {
    const XLSX = require('xlsx');
    const Income = require('../models/Income');
    const Budget = require('../models/Budget');
    const SavingsGoal = require('../models/SavingsGoal');

    const [expenses, income, budgets, goals] = await Promise.all([
      Expense.find({ userId: req.user._id }),
      Income.find({ userId: req.user._id }),
      Budget.find({ userId: req.user._id }),
      SavingsGoal.find({ userId: req.user._id })
    ]);

    const wb = XLSX.utils.book_new();

    const autoFitColumns = (worksheet, data) => {
      if (!data || data.length === 0) return;
      const colWidths = [];
      const keys = Object.keys(data[0]);
      keys.forEach((key, colIndex) => {
        let maxLen = String(key).length;
        data.forEach((row) => {
          const val = row[key] !== null && row[key] !== undefined ? String(row[key]) : '';
          if (val.length > maxLen) maxLen = val.length;
        });
        colWidths[colIndex] = { wch: Math.min(Math.max(maxLen + 4, 12), 45) };
      });
      worksheet['!cols'] = colWidths;
    };

    const totalExp = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalInc = income.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const netSavings = totalInc - totalExp;
    const savingsRate = totalInc > 0 ? ((netSavings / totalInc) * 100).toFixed(1) + '%' : '0.0%';

    const catTotals = {};
    const catCounts = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Other';
      catTotals[cat] = (catTotals[cat] || 0) + (Number(e.amount) || 0);
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    let topCategory = 'N/A';
    let topCategoryAmount = 0;
    Object.entries(catTotals).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategory = cat;
        topCategoryAmount = amt;
      }
    });

    // 1. Dashboard
    const dashboardRows = [
      { 'Financial Metric': 'Report Title', 'Metric Value': 'AI Smart Expense Tracker — Executive Summary', 'Notes': 'Confidential & Proprietary' },
      { 'Financial Metric': 'Account Owner', 'Metric Value': req.user.name || 'User', 'Notes': req.user.email || '' },
      { 'Financial Metric': 'Export Timestamp', 'Metric Value': new Date().toLocaleString('en-IN'), 'Notes': 'Generated via AI Smart Finance Engine' },
      { 'Financial Metric': 'Base Currency', 'Metric Value': 'INR (₹)', 'Notes': 'Indian Rupee' },
      { 'Financial Metric': '---', 'Metric Value': '---', 'Notes': '---' },
      { 'Financial Metric': 'Total Verified Inflow', 'Metric Value': `₹${totalInc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Notes': 'Cumulative verified income' },
      { 'Financial Metric': 'Total Verified Outflow', 'Metric Value': `₹${totalExp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Notes': 'Cumulative verified expenses' },
      { 'Financial Metric': 'Net Monthly Savings', 'Metric Value': `₹${netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Notes': netSavings >= 0 ? 'Surplus / Positive Cash Flow' : 'Deficit / Overspending' },
      { 'Financial Metric': 'Savings Rate (%)', 'Metric Value': savingsRate, 'Notes': 'Target benchmark: 20% or higher' },
      { 'Financial Metric': 'Top Spending Category', 'Metric Value': `${topCategory} (₹${topCategoryAmount.toLocaleString('en-IN')})`, 'Notes': 'Accounts for primary outflow' },
      { 'Financial Metric': 'Total Verified Transactions', 'Metric Value': expenses.length + income.length, 'Notes': `${expenses.length} expenses + ${income.length} income entries` },
      { 'Financial Metric': 'Monitored Category Budgets', 'Metric Value': budgets.length, 'Notes': 'Active monthly budget thresholds' },
      { 'Financial Metric': 'Active Savings Goals', 'Metric Value': goals.length, 'Notes': 'Target savings pools currently tracking' }
    ];
    const wsDashboard = XLSX.utils.json_to_sheet(dashboardRows);
    autoFitColumns(wsDashboard, dashboardRows);
    XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard');

    // 2. Transactions
    const combinedTransactions = [
      ...expenses.map((e) => ({
        Date: new Date(e.date || Date.now()).toLocaleDateString('en-IN'),
        rawDate: new Date(e.date || Date.now()).getTime(),
        Type: 'EXPENSE',
        'Title / Description': e.merchant || e.title || 'Expense',
        Category: e.category || 'Other',
        'Payment Method': e.paymentMethod || 'UPI',
        'Amount (₹)': -Math.abs(Number(e.amount) || 0),
        'Source / Proof': e.isImported ? (e.sourceFile?.fileName || 'Imported File') : 'Manual Entry'
      })),
      ...income.map((i) => ({
        Date: new Date(i.date || Date.now()).toLocaleDateString('en-IN'),
        rawDate: new Date(i.date || Date.now()).getTime(),
        Type: 'INCOME',
        'Title / Description': i.source || i.description || 'Income',
        Category: 'Income',
        'Payment Method': 'Bank Transfer',
        'Amount (₹)': Math.abs(Number(i.amount) || 0),
        'Source / Proof': i.isImported ? 'Imported File' : 'Manual Entry'
      }))
    ].sort((a, b) => b.rawDate - a.rawDate).map(({ rawDate, ...item }) => item);

    const wsTransactions = XLSX.utils.json_to_sheet(combinedTransactions.length ? combinedTransactions : [{ Notice: 'No transactions recorded' }]);
    if (combinedTransactions.length) autoFitColumns(wsTransactions, combinedTransactions);
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

    // 3. Expenses
    const expenseRows = expenses.map((e) => ({
      Date: new Date(e.date || Date.now()).toLocaleDateString('en-IN'),
      Title: e.title || 'Untitled Expense',
      Merchant: e.merchant || e.title || 'N/A',
      Category: e.category || 'Other',
      'Payment Method': e.paymentMethod || 'UPI',
      'Amount (₹)': Number(e.amount) || 0,
      'Is Imported': e.isImported ? 'YES' : 'NO',
      'Source File': e.sourceFile?.fileName || 'Direct Entry'
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expenseRows.length ? expenseRows : [{ Notice: 'No expenses recorded' }]);
    if (expenseRows.length) autoFitColumns(wsExpenses, expenseRows);
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

    // 4. Income
    const incomeRows = income.map((i) => ({
      Date: new Date(i.date || Date.now()).toLocaleDateString('en-IN'),
      Source: i.source || 'Primary Income',
      Description: i.description || 'N/A',
      'Amount (₹)': Number(i.amount) || 0,
      Status: 'Received'
    }));
    const wsIncome = XLSX.utils.json_to_sheet(incomeRows.length ? incomeRows : [{ Notice: 'No income records found' }]);
    if (incomeRows.length) autoFitColumns(wsIncome, incomeRows);
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Income');

    // 5. Category Summary
    const categorySummaryRows = Object.entries(catTotals).map(([cat, total]) => {
      const count = catCounts[cat] || 1;
      const share = totalExp > 0 ? ((total / totalExp) * 100).toFixed(2) + '%' : '0.00%';
      const avg = Math.round(total / count);
      return {
        Category: cat,
        'Total Spent (₹)': total,
        'Share of Spending (%)': share,
        'Transaction Count': count,
        'Average Spent per Transaction (₹)': avg
      };
    }).sort((a, b) => b['Total Spent (₹)'] - a['Total Spent (₹)']);

    const wsCategory = XLSX.utils.json_to_sheet(categorySummaryRows.length ? categorySummaryRows : [{ Notice: 'No expense categories' }]);
    if (categorySummaryRows.length) autoFitColumns(wsCategory, categorySummaryRows);
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Category Summary');

    // 6. Monthly Summary
    const monthMap = {};
    expenses.forEach((e) => {
      const d = new Date(e.date || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { expenses: 0, income: 0 };
      monthMap[key].expenses += (Number(e.amount) || 0);
    });
    income.forEach((i) => {
      const d = new Date(i.date || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { expenses: 0, income: 0 };
      monthMap[key].income += (Number(i.amount) || 0);
    });

    const monthlyRows = Object.keys(monthMap).sort().map((key) => {
      const inc = monthMap[key].income;
      const exp = monthMap[key].expenses;
      const net = inc - exp;
      const rate = inc > 0 ? ((net / inc) * 100).toFixed(1) + '%' : '0.0%';
      return {
        'Month / Year': key,
        'Total Inflow (₹)': inc,
        'Total Outflow (₹)': exp,
        'Net Savings (₹)': net,
        'Savings Rate (%)': rate,
        'Health Status': net >= 0 ? 'Surplus' : 'Deficit'
      };
    });

    const wsMonthly = XLSX.utils.json_to_sheet(monthlyRows.length ? monthlyRows : [{ Notice: 'No historical monthly data' }]);
    if (monthlyRows.length) autoFitColumns(wsMonthly, monthlyRows);
    XLSX.utils.book_append_sheet(wb, wsMonthly, 'Monthly Summary');

    // 7. Budget Performance
    const budgetRows = budgets.map((b) => {
      const spent = catTotals[b.category] || 0;
      const allocated = Number(b.amount) || 0;
      const remaining = allocated - spent;
      const pct = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) + '%' : '0.0%';
      let status = 'Safe';
      if (spent > allocated) status = 'Exceeded';
      else if (spent / allocated >= 0.8) status = 'Warning';

      return {
        Category: b.category,
        'Budget Allocated (₹)': allocated,
        'Actual Spent (₹)': spent,
        'Remaining Balance (₹)': remaining,
        '% Utilization': pct,
        'Health Status': status
      };
    });

    const wsBudget = XLSX.utils.json_to_sheet(budgetRows.length ? budgetRows : [{ Notice: 'No budgets defined' }]);
    if (budgetRows.length) autoFitColumns(wsBudget, budgetRows);
    XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget Performance');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `AI_Smart_Expense_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.status(200).send(buffer);
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
  getExpenseSummary,
  exportExcelDashboard
};
