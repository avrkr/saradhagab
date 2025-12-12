const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const createOtp = async (email, flow) => {
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing OTPs for this email and flow
  await Otp.deleteMany({ email, flow });

  await Otp.create({
    email,
    codeHash,
    expiresAt,
    flow
  });

  return code;
};

const verifyOtp = async (email, code, flow) => {
  const otpRecord = await Otp.findOne({ email, flow });
  
  if (!otpRecord) {
    return false;
  }

  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: otpRecord._id });
    return false;
  }

  const isValid = await bcrypt.compare(code, otpRecord.codeHash);
  
  if (isValid) {
    // OTP is valid, consume it
    await Otp.deleteOne({ _id: otpRecord._id });
  }

  return isValid;
};

module.exports = { createOtp, verifyOtp };
