const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  type: { type: String, enum: ['text','image','audio','location','gif'], default: 'text' },
  content: { type: mongoose.Schema.Types.Mixed }, // store base64 / JSON for location etc
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
