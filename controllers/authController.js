const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createOtp, verifyOtp } = require('../services/otpService');
const { sendOtpEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let profileImage = '';
    if (req.file) {
      profileImage = req.file.path.replace(/\\/g, '/');
    }
    
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (!user) {
      user = await User.create({ 
        name, 
        email, 
        passwordHash,
        profileImage 
      });
    } else {
      // Update name/password if user exists but not verified (re-signup attempt)
      user.name = name;
      user.passwordHash = passwordHash;
      if (profileImage) user.profileImage = profileImage;
      await user.save();
    }

    const otp = await createOtp(email, 'signup');
    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await verifyOtp(email, otp, 'signup');

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Please login via OTP or set a password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = await createOtp(email, 'forgot-password');
    await sendPasswordResetEmail(email, otp);

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await verifyOtp(email, otp, 'forgot-password');

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Return a temporary token or just success to allow password reset
    // For security, we should probably issue a short-lived token specifically for password reset
    // But for simplicity, we'll trust the client to call resetPassword immediately with the email
    // A better approach is to return a signed token that authorizes the resetPassword endpoint.
    
    const resetToken = jwt.sign({ email, purpose: 'reset-password' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    res.json({ message: 'OTP verified', resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken) return res.status(400).json({ error: 'Reset token required' });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'reset-password') {
      return res.status(400).json({ error: 'Invalid token purpose' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
