const bcrypt = require('bcrypt');
const db = require('./db'); // Ensure you have a database connection module

// Register a new user
async function registerUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [username, email, hashedPassword]);
    return result.insertId; // Return the ID of the newly created user
}

// Authenticate a user
async function authenticateUser(username, password) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await db.query(query, [username]);
    if (rows.length === 0) {
        throw new Error('User not found');
    }
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    return { id: user.id, username: user.username, email: user.email }; // Return user details
}

module.exports = { registerUser, authenticateUser };
