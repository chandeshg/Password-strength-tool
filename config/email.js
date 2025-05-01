const path = require('path');
const nodemailer = require('nodemailer');

console.log('Initializing email service...');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'chandeshgunawardena@gmail.com',
        pass: 'kyegmnolmxammvsm'
    }
});

async function sendVerificationEmail(to, code) {
    console.log('Processing verification email:', { to, code });

    const mailOptions = {
        from: '"SecurePass" <chandeshgunawardena@gmail.com>',
        to: to,
        subject: 'Your Verification Code',
        html: `
            <div style="padding: 20px; background: #f8f9fa; border-radius: 5px;">
                <h2>Your verification code is:</h2>
                <div style="font-size: 36px; color: #4776E6; text-align: center; padding: 20px;">
                    ${code}
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully:', { messageId: info.messageId, to });
        return info;
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
    }
}

// Just verify the connection
transporter.verify()
    .then(() => console.log('Email server is ready'))
    .catch(err => console.error('Email server error:', err));

module.exports = { transporter, sendVerificationEmail };
