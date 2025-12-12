const nodemailer = require("nodemailer");
const {
  otpTemplate,
  passwordResetTemplate,
  notificationTemplate,
} = require("../utils/emailTemplates");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // App password required
  },
  connectionTimeout: 10000, // 10 seconds
  tls: {
    rejectUnauthorized: false, // prevent certificate issues on some servers
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Email Service Error:", error);
  } else {
    console.log("Email Service is ready");
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// OTP EMAIL
const sendOtpEmail = async (to, otp) => {
  const html = otpTemplate(otp);
  try {
    await sendEmail(to, "Your Verification Code - Saradhaga", html);
  } catch (error) {
    console.log("==========================================");
    console.log(`[FALLBACK] OTP for ${to}: ${otp}`);
    console.log("==========================================");
    throw error;
  }
};

// PASSWORD RESET EMAIL
const sendPasswordResetEmail = async (to, otp) => {
  const html = passwordResetTemplate(otp);
  try {
    await sendEmail(to, "Reset Your Password - Saradhaga", html);
  } catch (error) {
    console.log("==========================================");
    console.log(`[FALLBACK] Reset OTP for ${to}: ${otp}`);
    console.log("==========================================");
    throw error;
  }
};

// NOTIFICATION EMAIL
const sendNotificationEmail = async (to, title, message, actionLink, actionText) => {
  const html = notificationTemplate(title, message, actionLink, actionText);
  await sendEmail(to, title, html);
};

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
};
