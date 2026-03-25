const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  premiumTier: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    default: 'free'
  },
  premiumUntil: {
    type: Date,
    default: null
  },
  emailsUsedThisMonth: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

// Update lastActivityAt on each query
userSchema.pre('findOneAndUpdate', function() {
  this.set({ lastActivityAt: new Date() });
});

module.exports = mongoose.model('User', userSchema);
