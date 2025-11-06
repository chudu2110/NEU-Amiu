const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: { type: String },
  password: {type: String},
  verified: { type: Boolean, default: true },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
