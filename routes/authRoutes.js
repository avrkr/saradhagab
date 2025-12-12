const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { otpLimiter } = require('../middleware/rateLimit');
const upload = require('../middleware/upload');

router.post('/signup', otpLimiter, upload.single('profileImage'), authController.signup);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/forgot-password', otpLimiter, authController.forgotPassword);
router.post('/verify-forgot-otp', authController.verifyForgotOtp);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
