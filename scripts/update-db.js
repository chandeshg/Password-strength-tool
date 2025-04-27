const mysql = require('mysql2/promise');
const pool = require('../config/database');

async function updateDatabase() {
    try {
        // Add verification columns
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN verification_token VARCHAR(255),
            ADD COLUMN is_verified BOOLEAN DEFAULT false,
            ADD COLUMN reset_token VARCHAR(255),
            ADD COLUMN reset_expires DATETIME
        `);
        
        console.log('Database schema updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating database schema:', error);
        process.exit(1);
    }
}

updateDatabase();
