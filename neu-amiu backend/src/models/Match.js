const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  lastMessageAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', MatchSchema);
