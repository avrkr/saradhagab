const nodemailer = require("nodemailer");
const {
  otpTemplate,
  passwordResetTemplate,
  notificationTemplate,
} = require("../utils/emailTemplates");

// Create Transporter
// We use a flexible configuration that works well with Gmail and other providers
const transporter = nodemailer.createTransport({
  service: "gmail", // Built-in support for Gmail (automatically handles host/port/secure)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add timeout settings to fail faster
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify connection configuration (non-blocking)
// This won't crash the app if email service is unavailable
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("⚠️  Email Service Error:", error.message);
      console.log("📧 Email functionality will be disabled. OTPs will be logged to console.");
    } else {
      console.log("✅ Email Service is ready");
    }
  });
} else {
  console.warn("⚠️  SMTP credentials not configured. Email functionality disabled.");
  console.log("📧 OTPs will be logged to console instead.");
}

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Saradhaga" <${process.env.SMTP_USER}>`, // Use the authenticated user as sender
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendOtpEmail = async (to, otp) => {
  const html = otpTemplate(otp);
  try {
    await sendEmail(to, "Your Verification Code - Saradhaga", html);
  } catch (error) {
    // Fallback logging for development/debugging if email fails
    console.log("==========================================");
    console.log(`[FALLBACK] OTP for ${to}: ${otp}`);
    console.log("==========================================");
    // We don't throw here to allow the flow to continue even if email fails
    // The user can get the OTP from logs (in dev) or try again
  }
};

const sendPasswordResetEmail = async (to, otp) => {
  const html = passwordResetTemplate(otp);
  try {
    await sendEmail(to, "Reset Your Password - Saradhaga", html);
  } catch (error) {
    console.log("==========================================");
    console.log(`[FALLBACK] Reset OTP for ${to}: ${otp}`);
    console.log("==========================================");
  }
};

const sendNotificationEmail = async (to, title, message, actionLink, actionText) => {
  const html = notificationTemplate(title, message, actionLink, actionText);
  try {
    await sendEmail(to, title, html);
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail, sendNotificationEmail };
