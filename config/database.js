require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'passwordtool_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Database initialization function
async function initializeDatabase() {
    try {
        // First try to create database if it doesn't exist
        const tempPool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root'
        });

        await tempPool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'passwordtool_db'}`);
        await tempPool.end();

        // Now connect to the database and create tables
        const conn = await pool.getConnection();
        console.log('Database connected successfully');

        // Create users table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                verification_token VARCHAR(6),
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Database tables initialized');
        conn.release();
    } catch (error) {
        console.error('Database initialization failed:', error.message);
        console.log('\nPlease ensure:');
        console.log('1. MySQL server is running');
        console.log('2. Update .env with correct MySQL credentials');
        console.log('3. Run: mysql -u root -p');
        console.log('4. Enter your MySQL root password\n');
    }
}

// Initialize database on startup
initializeDatabase();

module.exports = { pool };
