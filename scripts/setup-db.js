const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
    let connection;
    try {
        // Create initial connection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',     // Your MySQL username
            password: ''      // Your MySQL password
        });

        // Create and use database
        await connection.query('CREATE DATABASE IF NOT EXISTS securepass');
        await connection.query('USE securepass');

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

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
