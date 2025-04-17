const mysql = require('mysql2/promise');

async function setupDatabase() {
    let connection;
    try {
        // Update the username and password to match your MySQL credentials
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',  // MySQL username (default is root)
            password: '4444' //  MySQL password
        });

        console.log('Connected to MySQL server.');

        // Create the database
        await connection.query('CREATE DATABASE IF NOT EXISTS securepass');
        console.log('Database "securepass" created or already exists.');

        // Use the database
        await connection.query('USE securepass');

        // Create the users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table "users" created or already exists.');

        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();
