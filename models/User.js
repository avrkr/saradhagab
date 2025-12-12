const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // Optional initially for OTP signup
  isVerified: { type: Boolean, default: false },
  profileImage: { type: String, default: '' },
  popularityScore: { type: Number, default: 0 },
  badges: [{ type: String, enum: ['Bronze', 'Silver', 'Gold'] }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
