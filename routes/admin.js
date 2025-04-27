require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../db'); // Adjust the path as necessary

// Configure nodemailer with updated Gmail settings
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Update admin emails array with your email
const ADMIN_EMAILS = [process.env.EMAIL_USER || 'chandeshgunawardena@gmail.com'];

// Add verification before router setup
transporter.verify(function(error, success) {
    if (error) {
        console.error('SMTP Error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

// Add storage for reset tokens (replace with database in production)
const resetTokens = new Map();

router.post('/forgot-password', async (req, res) => {
    try {
        console.log('Received password reset request:', req.body);
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }

        // Check if username matches admin username
        const validUsername = 'admin'; // Replace with your actual admin username
        if (username !== validUsername) {
            return res.status(403).json({
                success: false,
                message: 'Invalid username'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Store token with expiry (1 hour)
        resetTokens.set(resetToken, {
            username: username,
            expiry: Date.now() + 3600000 // 1 hour
        });
        
        // Send email to admin email address
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Admin Password Reset Request',
            html: `
                <h2>Password Reset Request</h2>
                <p>A password reset was requested for admin account: ${username}</p>
                <p>Click the link below to reset your password:</p>
                <a href="http://localhost:3000/admin/reset-password?token=${resetToken}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
            `
        });

        console.log('Reset email sent successfully');
        res.json({
            success: true,
            message: 'If the username is valid, reset instructions have been sent.'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        console.log('Received token:', token); // Debug log

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        // Debug log for token verification
        console.log('Stored tokens:', Array.from(resetTokens.keys()));
        const tokenData = resetTokens.get(token);
        console.log('Token data:', tokenData);

        if (!tokenData) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token'
            });
        }

        if (Date.now() > tokenData.expiry) {
            resetTokens.delete(token);
            return res.status(400).json({
                success: false,
                message: 'Reset token has expired'
            });
        }

        // Token is valid, update password
        console.log(`Password updated for user: ${tokenData.username}`);
        resetTokens.delete(token);

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password'
        });
    }
});

// Update admin credentials
const adminCredentials = {
    email: 'admin@admin.com',
    password: 'admin123'
};

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Admin login attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        if (email === adminCredentials.email && password === adminCredentials.password) {
            return res.json({
                success: true,
                message: 'Login successful',
                username: 'Admin',
                email: email,
                isAdmin: true,
                redirect: '/admin/dashboard'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid admin credentials'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Add logout route
router.post('/logout', (req, res) => {
    try {
        if (req.session) {
            req.session.destroy();
        }
        res.clearCookie('admin_session');
        res.json({
            success: true,
            message: 'Logged out successfully',
            redirect: '/'  // Changed to redirect to home
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
});

// Add settings routes
router.get('/settings', (req, res) => {
    try {
        res.json({
            success: true,
            settings: {
                emailNotifications: true,
                defaultRole: 'user',
                sessionTimeout: 30
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching settings'
        });
    }
});

// Update users route
router.get('/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
        
        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            status: 'active',
            createdAt: user.created_at
        }));

        return res.json({
            success: true,
            users: formattedUsers
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// Get single user
router.get('/users/:id', (req, res) => {
    try {
        // Mock user data - replace with database query
        res.json({
            success: true,
            user: {
                id: req.params.id,
                username: '',
                email: '',
                status: 'pending'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
});

// Delete user
router.delete('/users/:id', (req, res) => {
    try {
        // Add database delete logic here
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

module.exports = router;