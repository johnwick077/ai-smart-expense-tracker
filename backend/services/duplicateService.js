const Expense = require('../models/Expense');
const Income = require('../models/Income');

/**
 * Checks a batch of candidate transactions against user's existing MongoDB transactions
 */
const detectDuplicates = async (userId, candidateTransactions) => {
  if (!candidateTransactions || candidateTransactions.length === 0) {
    return {
      transactions: [],
      duplicateCount: 0
    };
  }

  let duplicateCount = 0;

  const processed = await Promise.all(
    candidateTransactions.map(async (txn) => {
      const txnDate = new Date(txn.date);
      const minDate = new Date(txnDate.getTime() - 24 * 60 * 60 * 1000);
      const maxDate = new Date(txnDate.getTime() + 24 * 60 * 60 * 1000);

      const Model = txn.type === 'income' ? Income : Expense;

      // Search existing transactions within the ±24 hr timeframe matching amount and merchant
      const existing = await Model.findOne({
        userId,
        amount: txn.amount,
        date: { $gte: minDate, $lte: maxDate }
      });

      if (existing) {
        duplicateCount++;
        return {
          ...txn,
          isDuplicate: true,
          duplicateReason: `Matches existing transaction recorded on ${existing.date.toISOString().split('T')[0]} for ₹${existing.amount}`
        };
      }

      return {
        ...txn,
        isDuplicate: false,
        duplicateReason: null
      };
    })
  );

  return {
    transactions: processed,
    duplicateCount
  };
};

module.exports = {
  detectDuplicates
};
