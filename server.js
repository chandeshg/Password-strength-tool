const express = require('express');
const path = require('path');
const { registerUser, authenticateUser } = require('./auth');

const app = express();
app.use(express.json());

// Serve static files from the current directory
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ensure the server listens on the correct port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
