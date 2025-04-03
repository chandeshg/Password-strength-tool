const db = require('./db');
const bcrypt = require('bcrypt');

// Register a new user
async function registerUser(username, email, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        console.log('User registered with ID:', result.insertId);
        return result.insertId;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

// Authenticate a user
async function authenticateUser(username, password) {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            throw new Error('User not found');
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        console.log('User authenticated:', user.username);
        return user;
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
}

function onRegisterSuccess() {
    // ...existing code...
    window.location.href = '/password-tool.html'; // Redirect to password strength tool
}

function onSignInSuccess() {
    // ...existing code...
    window.location.href = '/password-tool.html'; // Redirect to password strength tool
}

module.exports = { registerUser, authenticateUser };
