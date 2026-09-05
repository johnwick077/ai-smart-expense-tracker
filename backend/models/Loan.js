const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Loan or Chitty name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  category: {
    type: String,
    enum: ['loan', 'chitty', 'investment', 'payable'],
    default: 'loan'
  },
  lender: {
    type: String,
    required: [true, 'Lender, bank, or organization is required'],
    trim: true,
    maxlength: [100, 'Lender cannot exceed 100 characters']
  },
  principalAmount: {
    type: Number,
    required: [true, 'Total / Principal amount is required'],
    min: [0, 'Principal amount cannot be negative']
  },
  monthlyEMI: {
    type: Number,
    default: 0,
    min: [0, 'Monthly EMI cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  paidThisMonth: {
    type: Number,
    default: 0,
    min: [0, 'Paid this month cannot be negative']
  },
  remainingBalance: {
    type: Number,
    required: [true, 'Remaining balance is required'],
    min: [0, 'Remaining balance cannot be negative']
  },
  interestRate: {
    type: Number,
    default: 0,
    min: [0, 'Interest rate cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'overdue'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
