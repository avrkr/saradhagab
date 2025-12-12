require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing SMTP Configuration...');

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: SMTP_USER or SMTP_PASS not found in environment variables.');
    console.log('   Make sure you have a .env file in the root of backend/ with these variables defined.');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    // Add timeout settings to catch connection issues quickly
    connectionTimeout: 10000,
});

console.log(`📧 Attempting to connect as: ${process.env.SMTP_USER}`);

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Connection Failed:', error.message);
        if (error.code === 'EAUTH') {
            console.log('   Hint: Check your App Password. You cannot use your regular Gmail password.');
            console.log('   See README.md for instructions on generating an App Password.');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('   Hint: Connection timed out. Check your firewall or network settings.');
        }
    } else {
        console.log('✅ Connection Successful! SMTP is ready to send emails.');
    }
});
