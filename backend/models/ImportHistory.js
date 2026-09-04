const mongoose = require('mongoose');

const importHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'xlsx', 'xls', 'csv', 'txt', 'json'],
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  transactionCount: {
    type: Number,
    default: 0
  },
  duplicatesDetected: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'partial'],
    default: 'completed'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  importedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

importHistorySchema.index({ userId: 1, importedAt: -1 });

module.exports = mongoose.model('ImportHistory', importHistorySchema);
