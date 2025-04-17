const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const pool = require('./db');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Email configuration with better error handling
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chandeshgunawardena@gmail.com',
        pass: 'madw qppg jukn haxc'
    }
});

// Test email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email setup error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Modified signup endpoint with better error handling
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check for existing user first
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            const isDuplicateUsername = existingUsers.some(user => user.username === username);
            const isDuplicateEmail = existingUsers.some(user => user.email === email);

            let message = '';
            if (isDuplicateUsername && isDuplicateEmail) {
                message = 'Both username and email are already taken';
            } else if (isDuplicateUsername) {
                message = 'Username is already taken';
            } else {
                message = 'Email is already taken';
            }

            return res.status(400).json({ message });
        }

        // If no duplicates, proceed with user creation
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute(
            'INSERT INTO users (username, email, password, verification_token, is_verified) VALUES (?, ?, ?, ?, false)',
            [username, email, hashedPassword, verificationCode]
        );

        // Send verification email
        await transporter.sendMail({
            from: 'chandeshgunawardena@gmail.com',
            to: email,
            subject: 'Verify your SecurePass account',
            html: `
                <h1>Welcome to SecurePass!</h1>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>Enter this code to complete your registration.</p>
            `
        });

        res.status(201).json({ 
            message: 'Please check your email for verification code',
            email: email
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Error during signup',
            details: error.message 
        });
    }
});

// Add verification endpoint
app.post('/api/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND verification_token = ?',
            [email, code]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        await pool.execute(
            'UPDATE users SET is_verified = true WHERE email = ?',
            [email]
        );

        res.json({ message: 'Account verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Error during verification' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        if (!user.is_verified) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Login successful',
            userId: user.id,
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users endpoint
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, username, email FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user endpoint
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});