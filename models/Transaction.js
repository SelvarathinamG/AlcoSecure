/**
 * Transaction Model
 * Records all alcohol purchase transactions
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  liquorType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiquorType',
    required: true
  },
  volumeMl: {
    type: Number,
    required: [true, 'Volume is required'],
    min: [1, 'Volume must be at least 1ml']
  },
  alcoholPercentage: {
    type: Number,
    required: true
  },
  pureAlcoholGrams: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['approved', 'rejected'],
    required: true
  },
  rejectionReason: {
    type: String,
    default: null
  },
  consumedBeforePurchase: {
    type: Number,
    default: 0
  },
  dailyLimitAtPurchase: {
    type: Number,
    required: true
  },
  pricePerUnit: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ user: 1, timestamp: -1 });
transactionSchema.index({ vendor: 1, timestamp: -1 });
transactionSchema.index({ status: 1, timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
