const Loan = require('../models/Loan');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get all loans, chitties, debt subtotals, and health analysis
// @route   GET /api/loans
// @access  Private
const getLoans = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const items = await Loan.find({ userId }).sort({ createdAt: -1 });

    // Separate Loans vs Chitties / Investments / Payables
    const loansList = items.filter(i => i.category === 'loan');
    const chittyList = items.filter(i => ['chitty', 'investment', 'payable'].includes(i.category));

    // Calculate Loan Subtotals
    const loanSubtotal = {
      count: loansList.length,
      principal: loansList.reduce((s, i) => s + (i.principalAmount || 0), 0),
      monthlyEMI: loansList.reduce((s, i) => s + (i.monthlyEMI || 0), 0),
      paidAmount: loansList.reduce((s, i) => s + (i.paidAmount || 0), 0),
      paidThisMonth: loansList.reduce((s, i) => s + (i.paidThisMonth || 0), 0),
      remainingBalance: loansList.reduce((s, i) => s + (i.remainingBalance || 0), 0)
    };

    // Calculate Chitty + Payable Subtotals
    const chittySubtotal = {
      count: chittyList.length,
      principal: chittyList.reduce((s, i) => s + (i.principalAmount || 0), 0),
      monthlyInstallment: chittyList.reduce((s, i) => s + (i.monthlyEMI || 0), 0),
      paidAmount: chittyList.reduce((s, i) => s + (i.paidAmount || 0), 0),
      paidThisMonth: chittyList.reduce((s, i) => s + (i.paidThisMonth || 0), 0),
      remainingBalance: chittyList.reduce((s, i) => s + (i.remainingBalance || 0), 0)
    };

    // Combined Grand Total
    const combinedDebt = loanSubtotal.remainingBalance + chittySubtotal.remainingBalance;
    const totalMonthlyCommitment = loanSubtotal.monthlyEMI + chittySubtotal.monthlyInstallment;
    const grandTotalPrincipal = loanSubtotal.principal + chittySubtotal.principal;
    const grandTotalPaid = loanSubtotal.paidAmount + chittySubtotal.paidAmount;

    // Fetch user monthly income to assess "doing good or bad" health score
    const incomes = await Income.find({ userId });
    const totalRecordedIncome = incomes.reduce((s, i) => s + i.amount, 0);
    // Baseline monthly income: recorded or standard ₹1,20,000 baseline
    const monthlyIncome = totalRecordedIncome > 0 ? totalRecordedIncome : 120000;

    // Debt Service Ratio (DSR / Debt-to-Income %)
    const dtiRatio = monthlyIncome > 0 ? ((totalMonthlyCommitment / monthlyIncome) * 100) : 0;
    const payoffProgress = grandTotalPrincipal > 0 ? ((grandTotalPaid / grandTotalPrincipal) * 100) : 0;

    // Evaluate Loan Health ("Doing Good or Bad")
    let healthStatus = 'good';
    let healthLabel = 'Doing Good';
    let healthBadgeColor = '#10B981';
    let healthScore = 85;
    let diagnosis = '';
    let recommendation = '';

    if (dtiRatio <= 30) {
      healthStatus = 'good';
      healthLabel = 'Doing Good / Low Risk';
      healthBadgeColor = '#10B981';
      healthScore = Math.max(80, Math.round(100 - dtiRatio));
      diagnosis = `Your debt commitments take only ${dtiRatio.toFixed(1)}% of your monthly cash flow. Your loans are performing well and repayment is on track.`;
      recommendation = 'Maintain regular payments. Any surplus cash can be routed to high-yield savings or mutual funds.';
    } else if (dtiRatio <= 50) {
      healthStatus = 'moderate';
      healthLabel = 'Manageable / Moderate';
      healthBadgeColor = '#F59E0B';
      healthScore = Math.max(55, Math.round(90 - dtiRatio));
      diagnosis = `Your monthly debt commitment is ₹${totalMonthlyCommitment.toLocaleString('en-IN')}, accounting for ${dtiRatio.toFixed(1)}% of monthly cash flow. This is in the manageable caution zone.`;
      recommendation = 'Prioritize clearing high-interest obligations (e.g. Gold Loan at 8.5%) or prepare for chitty bidding upon auction maturity.';
    } else {
      healthStatus = 'bad';
      healthLabel = 'High Burden / Needs Attention';
      healthBadgeColor = '#EF4444';
      healthScore = Math.max(30, Math.round(75 - (dtiRatio - 50)));
      diagnosis = `Critical Debt Pressure! Monthly debt service consumes ${dtiRatio.toFixed(1)}% of your income. Debt outflows significantly constrain savings.`;
      recommendation = 'Consider debt restructuring, chitty prize auction utilization, or paying off high-cost personal loans first.';
    }

    res.status(200).json({
      success: true,
      count: items.length,
      data: {
        items,
        loansList,
        chittyList,
        loanSubtotal,
        chittySubtotal,
        grandTotal: {
          combinedDebt,
          totalMonthlyCommitment,
          grandTotalPrincipal,
          grandTotalPaid,
          totalFacilities: items.length
        },
        healthAnalysis: {
          status: healthStatus,
          label: healthLabel,
          badgeColor: healthBadgeColor,
          score: healthScore,
          dtiRatio: parseFloat(dtiRatio.toFixed(1)),
          monthlyIncome,
          payoffProgress: parseFloat(payoffProgress.toFixed(1)),
          diagnosis,
          recommendation
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new loan, chitty, or debt facility
// @route   POST /api/loans
// @access  Private
const createLoan = async (req, res, next) => {
  try {
    const {
      name,
      category,
      lender,
      principalAmount,
      monthlyEMI,
      paidAmount,
      paidThisMonth,
      remainingBalance,
      interestRate,
      status,
      startDate,
      notes
    } = req.body;

    if (!name || !lender || principalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide loan name, lender/organization, and principal amount.'
      });
    }

    const newLoan = await Loan.create({
      userId: req.user._id,
      name,
      category: category || 'loan',
      lender,
      principalAmount: Number(principalAmount),
      monthlyEMI: Number(monthlyEMI) || 0,
      paidAmount: Number(paidAmount) || 0,
      paidThisMonth: Number(paidThisMonth) || 0,
      remainingBalance: remainingBalance !== undefined ? Number(remainingBalance) : Number(principalAmount),
      interestRate: Number(interestRate) || 0,
      status: status || 'active',
      startDate: startDate || new Date(),
      notes
    });

    res.status(201).json({
      success: true,
      data: newLoan,
      message: 'Loan facility created successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan or chitty details
// @route   PUT /api/loans/:id
// @access  Private
const updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan facility not found.' });
    }

    const fields = [
      'name', 'category', 'lender', 'principalAmount', 'monthlyEMI',
      'paidAmount', 'paidThisMonth', 'remainingBalance', 'interestRate', 'status', 'notes'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        loan[field] = req.body[field];
      }
    });

    await loan.save();

    res.status(200).json({
      success: true,
      data: loan,
      message: 'Loan details updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record EMI / Installment Payment
// @route   POST /api/loans/:id/payment
// @access  Private
const recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, notes, logAsExpense } = req.body;
    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid payment amount.' });
    }

    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan facility not found.' });
    }

    // Update loan balances
    loan.paidAmount = (loan.paidAmount || 0) + paymentAmount;
    loan.paidThisMonth = (loan.paidThisMonth || 0) + paymentAmount;
    loan.remainingBalance = Math.max(0, (loan.remainingBalance || 0) - paymentAmount);

    if (loan.remainingBalance === 0) {
      loan.status = 'closed';
    }

    await loan.save();

    // Optionally create an Expense entry under category 'Loan'
    if (logAsExpense !== false) {
      await Expense.create({
        userId: req.user._id,
        title: `${loan.name} EMI Payment`,
        merchant: loan.lender,
        amount: paymentAmount,
        category: 'Loan',
        paymentMethod: paymentMethod || 'UPI',
        date: new Date(),
        description: notes || `Monthly payment for ${loan.name}`
      });
    }

    res.status(200).json({
      success: true,
      data: loan,
      message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete loan facility
// @route   DELETE /api/loans/:id
// @access  Private
const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan facility not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Loan facility removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLoans,
  createLoan,
  updateLoan,
  recordPayment,
  deleteLoan
};
