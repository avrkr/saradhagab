const brandColors = {
  primary: '#FF7A59',
  accent: '#6C63FF',
  dark: '#0F172A',
  light: '#FFFFFF',
  text: '#333333'
};

const baseStyles = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: ${brandColors.text};
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9fafb;
`;

const containerStyles = `
  background-color: ${brandColors.light};
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const logoStyles = `
  font-size: 28px;
  font-weight: bold;
  color: ${brandColors.primary};
  margin-bottom: 30px;
  display: inline-block;
  text-decoration: none;
`;

const buttonStyles = `
  display: inline-block;
  background-color: ${brandColors.primary};
  color: ${brandColors.light};
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 20px;
`;

const otpStyles = `
  font-size: 36px;
  font-weight: bold;
  letter-spacing: 5px;
  color: ${brandColors.dark};
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  display: inline-block;
`;

const footerStyles = `
  margin-top: 30px;
  font-size: 12px;
  color: #888888;
  text-align: center;
`;

const otpTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="${baseStyles}">
    <div style="${containerStyles}">
      <a href="#" style="${logoStyles}">Saradhaga</a>
      <h2 style="color: ${brandColors.dark}; margin-bottom: 20px;">Verify Your Email</h2>
      <p>Use the code below to complete your verification process. This code will expire in 10 minutes.</p>
      <div style="${otpStyles}">${otp}</div>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div style="${footerStyles}">
      &copy; ${new Date().getFullYear()} Saradhaga. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const passwordResetTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="${baseStyles}">
    <div style="${containerStyles}">
      <a href="#" style="${logoStyles}">Saradhaga</a>
      <div style="font-size: 48px; color: ${brandColors.accent}; margin-bottom: 20px;">🔒</div>
      <h2 style="color: ${brandColors.dark}; margin-bottom: 20px;">Password Reset</h2>
      <p>We received a request to reset your password. Click the button below to proceed.</p>
      <p>Use this OTP to verify your identity:</p>
      <div style="${otpStyles}">${resetLink}</div> 
      <!-- Note: User asked for OTP flow for forgot password, so passing OTP here instead of link if that's the flow, 
           but variable name is resetLink. Assuming it's the OTP code based on prompt "User enters OTP". -->
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
    <div style="${footerStyles}">
      &copy; ${new Date().getFullYear()} Saradhaga. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const notificationTemplate = (title, message, actionLink = null, actionText = null) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="${baseStyles}">
    <div style="${containerStyles}">
      <a href="#" style="${logoStyles}">Saradhaga</a>
      <h2 style="color: ${brandColors.dark}; margin-bottom: 20px;">${title}</h2>
      <p>${message}</p>
      ${actionLink && actionText ? `<a href="${actionLink}" style="${buttonStyles}">${actionText}</a>` : ''}
    </div>
    <div style="${footerStyles}">
      &copy; ${new Date().getFullYear()} Saradhaga. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

module.exports = { otpTemplate, passwordResetTemplate, notificationTemplate };
