require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD
        });

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'password_tool'}`);
        console.log('Database created or already exists');

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME || 'password_tool'}`);

        // Create necessary tables
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS password_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                password_hash VARCHAR(255) NOT NULL,
                strength_score INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
        console.log('Tables created successfully');

        await connection.end();
        console.log('Database initialization completed');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();
