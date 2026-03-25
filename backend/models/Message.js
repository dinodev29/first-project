const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: true,
    index: true
  },
  sender: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    default: null
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    default: ''
  },
  htmlBody: {
    type: String,
    default: ''
  },
  receivedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  messageId: {
    type: String,
    unique: true,
    sparse: true
  },
  read: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Message', messageSchema);
