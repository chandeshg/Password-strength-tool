const { registerUser, authenticateUser } = require('./auth');

async function test() {
    try {
        // Register a new user
        const userId = await registerUser('testuser', 'test@example.com', 'password123');
        console.log('Registered user ID:', userId);

        // Authenticate the user
        const user = await authenticateUser('testuser', 'password123');
        console.log('Authenticated user:', user);
    } catch (error) {
        console.error(error.message);
    }
}

test();
