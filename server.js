require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const { transporter, sendVerificationEmail } = require('./config/email');
const { pool } = require('./config/database');

const app = express();

// Middleware
// Update CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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

// Add admin middleware after checkAuth middleware
const checkAdmin = (req, res, next) => {
    if (!req.session || !req.session.admin) {
        return res.redirect('/admin/login');
    }
    next();
};

// Update root route with auth check
app.get('/', checkAuth, (req, res) => {
    res.redirect('/password-tool');
});

// Add public route for landing page
app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Update signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Starting signup process:', { email, username });

        // Check if email already exists
        const existingUser = await executeQuery(
            'SELECT email FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (existingUser && existingUser.length > 0) {
            console.log('Email already registered:', email);
            return res.status(400).json({
                success: false,
                message: 'This email is already registered. Please use a different email or try logging in.'
            });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated verification code:', verificationCode);

        try {
            await sendVerificationEmail(email, verificationCode);
            console.log('Verification email sent successfully');

            await executeQuery(
                'INSERT INTO users (username, email, password, verification_token, is_verified) VALUES (?, ?, ?, ?, false)',
                [username, email, password, verificationCode]
            );

            console.log('User saved successfully');
            return res.status(201).json({
                success: true,
                message: 'Please check your email for verification code',
                email: email
            });
        } catch (error) {
            console.error('Operation failed:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to complete signup. Please try again.'
            });
        }
    } catch (error) {
        console.error('Signup process failed:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred'
        });
    }
});

// Verification endpoint
app.post('/api/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        const users = await executeQuery(
            'SELECT * FROM users WHERE email = ? AND verification_token = ?',
            [email, code]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        await executeQuery(
            'UPDATE users SET is_verified = true WHERE email = ?',
            [email]
        );

        res.json({ message: 'Account verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Error during verification' });
    }
});

// Add resend verification endpoint
app.post('/api/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Resending verification for:', email);
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        await sendVerificationEmail(email, verificationCode);
        
        await executeQuery(
            'UPDATE users SET verification_token = ? WHERE email = ?',
            [verificationCode, email]
        );

        res.json({
            success: true,
            message: 'Verification code resent'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification code'
        });
    }
});

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

// Track active sessions
const activeSessions = new Map();

// Update login endpoint to track sessions
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if this is admin login
        if (email === 'admin@admin.com' && password === 'admin123') {
            req.session.admin = true;
            req.session.user = {
                id: 0,
                email: 'admin@admin.com',
                username: 'Admin',
                isAdmin: true
            };
            return res.json({
                success: true,
                redirect: '/admin-dashboard'
            });
        }

        // Regular user login
        console.log('Login attempt for:', email);

        const users = await executeQuery(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];
        const sessionId = crypto.randomBytes(16).toString('hex');
        
        req.session.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            isAuthenticated: true,
            sessionId
        };

        // Track user session
        activeSessions.set(sessionId, {
            userId: user.id,
            username: user.username,
            email: user.email,
            loginTime: new Date(),
            lastActivity: new Date()
        });

        return res.json({
            success: true,
            user: {
                username: user.username,
                email: user.email
            },
            redirect: '/password-tool'
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

// Update admin routes
app.get('/admin/dashboard', checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin/dashboard.html'));
});

app.get('/admin-dashboard', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

app.get('/admin/users', checkAuth, async (req, res) => {
    try {
        const users = await executeQuery(
            'SELECT id, username, email, DATE_FORMAT(created_at, "%Y-%m-%d") as created_at, is_verified FROM users',
            []
        );
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Add API endpoint to get all users
app.get('/api/admin/users', checkAdmin, async (req, res) => {
    try {
        const users = await executeQuery(
            'SELECT id, username, email, DATE_FORMAT(created_at, "%Y-%m-%d") as created_at, is_verified FROM users ORDER BY created_at DESC',
            []
        );
        res.json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Add endpoint for deleting users
app.delete('/api/admin/users/:id', checkAdmin, async (req, res) => {
    try {
        await executeQuery('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

// Add endpoint to get active sessions
app.get('/api/admin/active-sessions', checkAdmin, (req, res) => {
    const sessions = Array.from(activeSessions.values());
    res.json({ success: true, sessions });
});

// Add logout endpoint
app.post('/api/logout', (req, res) => {
    const sessionId = req.session?.user?.sessionId;
    if (sessionId) {
        activeSessions.delete(sessionId);
    }
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, message: 'Error during logout' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Add user info endpoint
app.get('/api/user', checkAuth, (req, res) => {
    res.json({
        username: req.session.user.username,
        email: req.session.user.email
    });
});

// Add delete account endpoint
app.delete('/api/user/delete', checkAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
        
        req.session.destroy(err => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            res.json({ success: true, message: 'Account deleted successfully' });
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete account' 
        });
    }
});

// Add footer page routes
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

// Update database query helper with better error handling
const executeQuery = async (query, params) => {
    try {
        const [results] = await pool.query(query, params);
        return results;
    } catch (error) {
        console.error('Database error:', {
            query: query.substring(0, 100),
            error: error.message
        });
        throw new Error(`Database operation failed: ${error.message}`);
    }
};

// Admin endpoints
app.get('/admin/users', checkAuth, async (req, res) => {
    try {
        const users = await executeQuery(
            'SELECT id, username, email, DATE_FORMAT(created_at, "%Y-%m-%d") as created_at, is_verified FROM users',
            []
        );
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

app.put('/admin/users/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;
        await executeQuery(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            [username, email, id]
        );
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

app.delete('/admin/users/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await executeQuery('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

// Update server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
