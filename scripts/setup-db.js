const mysql = require('mysql2/promise');

async function setupDatabase() {
    let connection;
    try {
        // Connect to MySQL server
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',      // Replace with your MySQL username
            password: '4444'       // Replace with your MySQL password
        });

        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS securepass');
        console.log('Database created successfully');

        // Use the database
        await connection.query('USE securepass');

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                verification_token VARCHAR(255),
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created successfully');

        console.log('Database setup completed!');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();
