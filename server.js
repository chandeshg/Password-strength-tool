require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const pool = require('./config/database');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const session = require('express-session');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// Update session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    },
    name: 'sessionId'
}));

// Email configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true,
    logger: true,
    tls: {
        rejectUnauthorized: false
    }
});

// Test email configuration with better error handling
transporter.verify((error, success) => {
    if (error) {
        console.error('Email setup error:', {
            message: error.message,
            code: error.code,
            command: error.command
        });
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Check existing user in database
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        // Insert new user into database
        await pool.query(
            'INSERT INTO users (username, email, password, verification_token, is_verified) VALUES (?, ?, ?, ?, false)',
            [username, email, password, verificationCode]
        );

        // Send verification email
        await transporter.sendMail({
            from: `"SecurePass" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your SecurePass Account',
            html: `
                <h1>Welcome to SecurePass!</h1>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>Enter this code to complete your registration.</p>
            `
        });

        res.status(201).json({
            success: true,
            message: 'Please check your email for verification code',
            email: email
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during signup'
        });
    }
});

// Verification endpoint
app.post('/api/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND verification_token = ?',
            [email, code]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        await pool.query(
            'UPDATE users SET is_verified = true WHERE email = ?',
            [email]
        );

        res.json({ message: 'Account verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Error during verification' });
    }
});

// Update auth middleware
const checkAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        if (req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required',
                redirect: '/login'
            });
        }
        return res.redirect('/login');
    }
    next();
};

// Protected routes
app.get('/password-tool', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'password-tool.html'));
});

// Login routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Update login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        if (!user.is_verified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // User authenticated, set session
        req.session.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            isAuthenticated: true
        };

        return new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) {
                    console.error('Session save error:', err);
                    reject(err);
                    return;
                }
                
                res.json({
                    success: true,
                    user: {
                        username: user.username,
                        email: user.email
                    },
                    redirect: '/password-tool'
                });
                resolve();
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (username === 'admin' && password === 'admin123') {
            req.session.admin = true;
            req.session.username = username;

            return res.json({
                success: true,
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
            message: 'Server error'
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
