const Expense = require('../models/Expense');
const Income = require('../models/Income');
const ImportHistory = require('../models/ImportHistory');
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
    const { fileName, fileType, fileSize, transactions } = req.body;

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
        confirmedCount: transactions.length
      }
    });

    const expensesToInsert = [];
    const incomesToInsert = [];

    // 2. Separate into Expenses and Income
    transactions.forEach(txn => {
      const record = {
        userId: req.user._id,
        amount: parseFloat(txn.amount),
        date: txn.date ? new Date(txn.date) : new Date(),
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

    // 3. Bulk insert
    let savedExpenses = [];
    let savedIncomes = [];

    if (expensesToInsert.length > 0) {
      savedExpenses = await Expense.insertMany(expensesToInsert);
    }
    if (incomesToInsert.length > 0) {
      savedIncomes = await Income.insertMany(incomesToInsert);
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${savedExpenses.length} expenses and ${savedIncomes.length} income transactions.`,
      data: {
        importId: importHistory._id,
        savedExpensesCount: savedExpenses.length,
        savedIncomeCount: savedIncomes.length,
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
