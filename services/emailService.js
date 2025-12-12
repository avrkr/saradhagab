const nodemailer = require('nodemailer');
const { otpTemplate, passwordResetTemplate, notificationTemplate } = require('../utils/emailTemplates');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
  await sendEmail(to, 'Your Verification Code - Saradhaga', html);
};

const sendPasswordResetEmail = async (to, otp) => {
  const html = passwordResetTemplate(otp);
  await sendEmail(to, 'Reset Your Password - Saradhaga', html);
};

const sendNotificationEmail = async (to, title, message, actionLink, actionText) => {
  const html = notificationTemplate(title, message, actionLink, actionText);
  await sendEmail(to, title, html);
};

module.exports = { sendOtpEmail, sendPasswordResetEmail, sendNotificationEmail };
