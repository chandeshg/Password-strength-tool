const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'chandeshgunawardena@gmail.com',
        pass: 'ubpf oksm fcwa dsok'
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true
});

// Test email configuration
async function verifyEmailConfig() {
    try {
        await transporter.verify();
        console.log('Email configuration is valid');
        return true;
    } catch (error) {
        console.error('Email configuration error:', error);
        return false;
    }
}

module.exports = { transporter, verifyEmailConfig };
