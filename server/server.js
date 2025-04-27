require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { transporter, verifyConnection } = require('../config/emailConfig');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Email verification check
verifyConnection().catch(console.error);

// Update signup endpoint
app.post('/api/signup', express.json(), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Insert user with verification code
        await pool.execute(
            'INSERT INTO users (username, email, password, verification_token, is_verified) VALUES (?, ?, ?, ?, false)',
            [username, email, password, verificationCode]
        );

        // Send verification email
        const mailOptions = {
            from: `"SecurePass" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your SecurePass Account',
            html: `
                <h1>Welcome to SecurePass!</h1>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>Enter this code to complete your registration.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);

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
app.post('/api/login', express.json(), async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.execute(
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

        if (user.password === password) {
            req.session.user = {
                id: user.id,
                email: user.email,
                username: user.username
            };
            
            return res.json({
                success: true,
                redirect: '/user/login.html'  // Redirect to password tool
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Admin login endpoint
app.post('/api/admin/login', express.json(), (req, res) => {
    try {
        console.log('Admin login attempt:', req.body);
        const { username, password } = req.body;

        // Admin credentials check (in production, use environment variables)
        const ADMIN_USER = 'admin';
        const ADMIN_PASS = 'admin123';

        if (username === ADMIN_USER && password === ADMIN_PASS) {
            // Set admin session
            req.session.admin = true;
            req.session.username = username;

            return res.json({
                success: true,
                message: 'Admin login successful',
                redirect: '/admin/dashboard'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid admin credentials'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
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

// Admin: Get all users
app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, is_verified, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Update user
app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;
        
        await pool.execute(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            [username, email, id]
        );
        
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot password endpoint
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'No account found with this email' });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour
        
        // Store reset token
        await pool.execute(
            'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
            [resetToken, resetExpires, email]
        );
        
        // Send reset email
        const resetLink = `http://localhost:3000/reset-password.html?token=${resetToken}`;
        await transporter.sendMail({
            from: 'chandeshgunawardena@gmail.com',
            to: email,
            subject: 'Password Reset - SecurePass',
            html: `
                <h1>Password Reset Request</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire in 1 hour.</p>
            `
        });
        
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});

// Reset password endpoint
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Check if token exists and is not expired
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()',
            [token]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ 
                message: 'Invalid or expired reset token' 
            });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password and clear reset token
        await pool.execute(
            'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?',
            [hashedPassword, token]
        );
        
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});