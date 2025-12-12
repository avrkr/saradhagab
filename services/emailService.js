const nodemailer = require("nodemailer");
const {
  otpTemplate,
  passwordResetTemplate,
  notificationTemplate,
} = require("../utils/emailTemplates"); // Ensure the path is correct

// 1. Create the Transporter
// The 'secure' flag is important. Use port 465 with secure: true, or port 587 with secure: false.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === "465", // Use SSL/TLS if port is 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 2. Verify connection
transporter.verify((error, success) => {
  if (error) {
    // This logs the ETIMEDOUT error you saw
    console.error("Email Service Error:", error); 
  } else {
    console.log("Email Service is ready and connected.");
  }
});

// 3. Core Email Sending Function
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

// 4. Specific Email Functions
// OTP EMAIL (includes your fallback logic)
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

// PASSWORD RESET EMAIL (includes your fallback logic)
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