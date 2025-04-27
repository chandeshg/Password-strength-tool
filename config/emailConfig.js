require('dotenv').config();
const nodemailer = require('nodemailer');

const config = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
};

const transporter = nodemailer.createTransport(config);

async function verifyConnection() {
    try {
        await transporter.verify();
        console.log('Email configuration verified successfully');
        return true;
    } catch (error) {
        console.error('Email configuration error:', error);
        return false;
    }
}

module.exports = { transporter, verifyConnection };
