const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  address: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
    expires: 0  // TTL index - auto delete when this date is reached
  },
  active: {
    type: Boolean,
    default: true
  },
  lifetime: {
    type: String,
    enum: ['15min', '1hour', '6hours', '24hours'],
    default: '24hours'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  customName: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Email', emailSchema);
