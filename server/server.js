const express = require('express');
const path = require('path');
const { registerUser, authenticateUser } = require('../auth');

const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for user registration
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userId = await registerUser(username, email, password);
        res.status(201).json({ message: 'User registered', userId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// API endpoint for user authentication
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await authenticateUser(username, password);
        res.status(200).json({ message: 'User authenticated', user });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Fetch all users
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Serve the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ensure the server listens on the correct port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
