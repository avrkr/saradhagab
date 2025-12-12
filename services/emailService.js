const nodemailer = require("nodemailer");
const {
  otpTemplate,
  passwordResetTemplate,
  notificationTemplate,
} = require("../utils/emailTemplates");

// -------------------------------------------
// 1. Create Transporter (Dynamic & Correct)
// -------------------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // 465 = SSL, others = STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Optional: If strict TLS is required by provider, uncomment this
// tls: {
//   rejectUnauthorized: true,
//   minVersion: "TLSv1.2",
// }

// -------------------------------------------
// 2. Verify Transporter
// -------------------------------------------
transporter.verify((error, success) => {
  if (error) {
    console.error("Email Service Error:", error);
  } else {
    console.log("Email Service is ready and connected.");
  }
});

// -------------------------------------------
// 3. Core Email Sending Function
// -------------------------------------------
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
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

// -------------------------------------------
// 4. Specific Email Functions
// -------------------------------------------

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
const sendNotificationEmail = async (
  to,
  title,
  message,
  actionLink,
  actionText
) => {
  const html = notificationTemplate(title, message, actionLink, actionText);
  await sendEmail(to, title, html);
};

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
};
