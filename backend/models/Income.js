const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  source: {
    type: String,
    required: [true, 'Income source is required'],
    trim: true,
    maxlength: [150, 'Source cannot exceed 150 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Income date is required'],
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
  }
}, {
  timestamps: true
});

incomeSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
