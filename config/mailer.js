require('dotenv').config();
const nodemailer = require('nodemailer');

const mailer = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    logger: process.env.NODE_ENV === 'development'
});

// Test connection
async function verifyMailer() {
    try {
        await mailer.verify();
        console.log('Email service is ready');
        return true;
    } catch (error) {
        console.error('Email service error:', error);
        return false;
    }
}

module.exports = { mailer, verifyMailer };
