const nodemailer = require('nodemailer');
const { otpTemplate, passwordResetTemplate, notificationTemplate } = require('../utils/emailTemplates');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email Service Error:', error);
  } else {
    console.log('Email Service is ready');
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendOtpEmail = async (to, otp) => {
  const html = otpTemplate(otp);
  try {
    await sendEmail(to, 'Your Verification Code - Saradhaga', html);
  } catch (error) {
    console.log('==========================================');
    console.log(`[FALLBACK] OTP for ${to}: ${otp}`);
    console.log('==========================================');
    throw error;
  }
};

const sendPasswordResetEmail = async (to, otp) => {
  const html = passwordResetTemplate(otp);
  try {
    await sendEmail(to, 'Reset Your Password - Saradhaga', html);
  } catch (error) {
    console.log('==========================================');
    console.log(`[FALLBACK] Reset OTP for ${to}: ${otp}`);
    console.log('==========================================');
    throw error;
  }
};

const sendNotificationEmail = async (to, title, message, actionLink, actionText) => {
  const html = notificationTemplate(title, message, actionLink, actionText);
  await sendEmail(to, title, html);
};

module.exports = { sendOtpEmail, sendPasswordResetEmail, sendNotificationEmail };
