const Expense = require('../models/Expense');
const Income = require('../models/Income');
const ImportHistory = require('../models/ImportHistory');
const Loan = require('../models/Loan');
const { parseFinancialFile } = require('../services/fileParserService');
const { detectDuplicates } = require('../services/duplicateService');
const { categorizeBatch } = require('../services/aiService');

// @desc    Upload file, parse contents, detect duplicates, and suggest AI categories
// @route   POST /api/import/upload
// @access  Private
const uploadAndAnalyze = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF, Excel, CSV, TXT, or JSON statement.'
      });
    }

    const statementMonth = req.body.statementMonth ? parseInt(req.body.statementMonth, 10) : null;
    const statementYear = req.body.statementYear ? parseInt(req.body.statementYear, 10) : null;

    // Step 1 & 2: Parse file and extract raw rows
    const parseResult = await parseFinancialFile(req.file);

    if (!parseResult.transactions || parseResult.transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract valid transactions from this file. Please verify file format and columns.'
      });
    }

    // Step 3: Run duplicate detection against user's past records
    const duplicateResult = await detectDuplicates(req.user._id, parseResult.transactions);

    // Step 4: Run AI batch categorization
    const categorizedTransactions = await categorizeBatch(duplicateResult.transactions);

    res.status(200).json({
      success: true,
      message: 'File parsed and categorized successfully. Ready for review.',
      data: {
        fileName: parseResult.fileName,
        fileType: parseResult.fileType,
        fileSize: parseResult.fileSize,
        totalExtracted: categorizedTransactions.length,
        duplicatesDetected: duplicateResult.duplicateCount,
        statementMonth,
        statementYear,
        transactions: categorizedTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm and commit reviewed transactions into MongoDB
// @route   POST /api/import/process
// @access  Private
const processImport = async (req, res, next) => {
  try {
    const { fileName, fileType, fileSize, transactions, statementMonth, statementYear } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No transactions provided for commit.'
      });
    }

    // 1. Create ImportHistory record
    const importHistory = await ImportHistory.create({
      userId: req.user._id,
      fileName: fileName || 'statement_import',
      fileType: fileType || 'csv',
      fileSize: fileSize || 0,
      transactionCount: transactions.length,
      duplicatesDetected: transactions.filter(t => t.isDuplicate).length,
      status: 'completed',
      metadata: {
        confirmedCount: transactions.length,
        statementMonth: statementMonth ? parseInt(statementMonth, 10) : null,
        statementYear: statementYear ? parseInt(statementYear, 10) : null
      }
    });

    const expensesToInsert = [];
    const incomesToInsert = [];

    // 2. Separate into Expenses and Income
    transactions.forEach(txn => {
      let txnDate = txn.date ? new Date(txn.date) : new Date();
      // If statement period was explicitly chosen and txn date was invalid or fallback
      if (statementMonth && statementYear && (!txn.date || isNaN(txnDate.getTime()))) {
        txnDate = new Date(parseInt(statementYear, 10), parseInt(statementMonth, 10) - 1, 1);
      }

      const record = {
        userId: req.user._id,
        amount: parseFloat(txn.amount),
        date: txnDate,
        description: txn.description || '',
        merchant: txn.merchant || txn.title || 'Unknown Merchant',
        sourceFile: {
          fileName: fileName || 'imported_file',
          fileType: fileType || 'unknown',
          importId: importHistory._id
        },
        isImported: true
      };

      if (txn.type === 'income') {
        incomesToInsert.push({
          ...record,
          source: txn.merchant || txn.description || 'Imported Income'
        });
      } else {
        expensesToInsert.push({
          ...record,
          title: txn.description || txn.merchant || 'Imported Expense',
          category: txn.category || 'Other',
          paymentMethod: txn.paymentMethod || 'Other',
          aiCategorized: Boolean(txn.aiCategorized),
          aiConfidence: txn.aiConfidence || null
        });
      }
    });

    // 3. Bulk insert Expenses and Incomes
    let savedExpenses = [];
    let savedIncomes = [];

    if (expensesToInsert.length > 0) {
      savedExpenses = await Expense.insertMany(expensesToInsert);
    }
    if (incomesToInsert.length > 0) {
      savedIncomes = await Income.insertMany(incomesToInsert);
    }

    // 4. Auto-retrieve and sync Loans & Debt into Loan collection
    const loanTxns = transactions.filter(t => 
      t.category === 'Loan' ||
      /\b(loan|chitty|chitti|chit fund|gold loan|emi|interest|ksfe|kudumbasree|svep|hpl|payable)\b/i.test(`${t.description} ${t.merchant}`)
    );

    let syncedLoansCount = 0;
    for (const lTxn of loanTxns) {
      const fullText = `${lTxn.description || ''} ${lTxn.merchant || ''}`;
      const isChitty = /chitty|chitti|chit fund|ksfe/i.test(fullText);
      const isPayable = /payable|balance payable/i.test(fullText);
      const isGoldLoan = /gold loan|goldloan|muthoot|manappuram/i.test(fullText);
      const category = isChitty ? 'chitty' : isPayable ? 'payable' : 'loan';
      const cleanName = (lTxn.merchant && lTxn.merchant !== 'Verified Transaction' && lTxn.merchant !== 'Unknown Merchant' ? lTxn.merchant : lTxn.description) || 'Imported Facility';
      const lender = lTxn.merchant || (isChitty ? 'KSFE' : isGoldLoan ? 'Canara / Muthoot' : 'Bank / Co-op');
      const amount = parseFloat(lTxn.amount) || 0;

      // Check for existing matching facility
      const existing = await Loan.findOne({
        userId: req.user._id,
        $or: [
          { name: new RegExp(cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          { lender: new RegExp(lender.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
        ]
      });

      if (existing) {
        existing.paidAmount = (existing.paidAmount || 0) + amount;
        existing.paidThisMonth = (existing.paidThisMonth || 0) + amount;
        existing.remainingBalance = Math.max(0, (existing.remainingBalance || 0) - amount);
        if (existing.remainingBalance === 0) existing.status = 'closed';
        await existing.save();
        syncedLoansCount++;
      } else {
        await Loan.create({
          userId: req.user._id,
          name: cleanName,
          category,
          lender,
          principalAmount: amount * 5 > 0 ? amount * 5 : amount, // baseline estimated principal or amount
          monthlyEMI: amount,
          paidAmount: amount,
          paidThisMonth: amount,
          remainingBalance: amount * 4 > 0 ? amount * 4 : amount,
          interestRate: isGoldLoan ? 8.5 : 0,
          status: 'active',
          notes: `Auto-retrieved from imported statement "${fileName || 'Statement'}"`
        });
        syncedLoansCount++;
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${savedExpenses.length} expenses and ${savedIncomes.length} income transactions.${syncedLoansCount > 0 ? ` Automatically synced ${syncedLoansCount} facilities to your Loans & Debt portfolio.` : ''}`,
      data: {
        importId: importHistory._id,
        savedExpensesCount: savedExpenses.length,
        savedIncomeCount: savedIncomes.length,
        syncedLoansCount,
        totalSaved: savedExpenses.length + savedIncomes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's import history
// @route   GET /api/import/history
// @access  Private
const getImportHistory = async (req, res, next) => {
  try {
    const history = await ImportHistory.find({ userId: req.user._id }).sort({ importedAt: -1 });
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get import history entry by ID
// @route   GET /api/import/:id
// @access  Private
const getImportById = async (req, res, next) => {
  try {
    const item = await ImportHistory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Import history record not found.' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete import history entry
// @route   DELETE /api/import/:id
// @access  Private
const deleteImportHistory = async (req, res, next) => {
  try {
    const item = await ImportHistory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Import history record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Import history record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAndAnalyze,
  processImport,
  getImportHistory,
  getImportById,
  deleteImportHistory
};
