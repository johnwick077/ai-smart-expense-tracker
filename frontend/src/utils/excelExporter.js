import * as XLSX from 'xlsx';

/**
 * Generates and downloads a multi-sheet professional Excel workbook
 * compliant with the AI Smart Expense Tracker specifications.
 * 
 * 7 Sheets:
 * 1. Dashboard (KPIs, Financial Health Overview)
 * 2. Transactions (Master ledger of Incomes & Expenses)
 * 3. Expenses (Filtered Expense Ledger)
 * 4. Income (Filtered Income Ledger)
 * 5. Category Summary (Categorical aggregations, percentage share)
 * 6. Monthly Summary (Month-over-month inflow vs outflow)
 * 7. Budget Performance (Allotted vs Actual spend, health status)
 */
export const exportDashboardToExcel = ({
  user = { name: 'Joel User', email: 'joel.user@example.com' },
  expenses = [],
  income = [],
  budgets = [],
  goals = []
}) => {
  const wb = XLSX.utils.book_new();

  // Helper: auto-fit column widths
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

  // Calculations
  const totalExp = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalInc = income.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const netSavings = totalInc - totalExp;
  const savingsRate = totalInc > 0 ? ((netSavings / totalInc) * 100).toFixed(1) + '%' : '0.0%';

  // Top category
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

  // --------------------------------------------------------------------------
  // SHEET 1: Dashboard (Executive Summary)
  // --------------------------------------------------------------------------
  const dashboardRows = [
    { 'Financial Metric': 'Report Title', 'Metric Value': 'AI Smart Expense Tracker — Executive Summary', 'Notes': 'Confidential & Proprietary' },
    { 'Financial Metric': 'Account Owner', 'Metric Value': user.name || 'User', 'Notes': user.email || '' },
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

  // --------------------------------------------------------------------------
  // SHEET 2: Transactions (Master Chronological Ledger)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // SHEET 3: Expenses (Expense Ledger)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // SHEET 4: Income (Income Ledger)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // SHEET 5: Category Summary (Aggregations & Proportions)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // SHEET 6: Monthly Summary (Month-over-Month Cashflow)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // SHEET 7: Budget Performance (Allotted vs Actual)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Trigger File Download
  // --------------------------------------------------------------------------
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `AI_Smart_Expense_Report_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);

  return filename;
};
