const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'Other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  merchant: {
    type: String,
    trim: true,
    default: 'Unknown Merchant'
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Other'],
    default: 'Other'
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  sourceFile: {
    fileName: { type: String, default: null },
    fileType: { type: String, default: null },
    importId: { type: mongoose.Schema.Types.ObjectId, ref: 'ImportHistory', default: null }
  },
  isImported: {
    type: Boolean,
    default: false
  },
  aiCategorized: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  }
}, {
  timestamps: true
});

// Strategic compound indexes for queries, analytics & duplicate detection
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, date: 1, amount: 1, merchant: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
