const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CARD', 'WALLET'],
    required: true,
  },
  idempotencyKey: {
    type: String,
    required: true,
    unique: true, // IMPORTANT: Enforces idempotency at DB level
  },
  status: {
    type: String,
    enum: ['CREATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'RETRYING'],
    default: 'CREATED',
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },
  gatewayResponse: {
    type: Object,
    default: null,
  },
  webhookStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING',
  }
}, { timestamps: true });

// Add indexing for faster queries and metrics
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
