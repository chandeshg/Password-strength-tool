require('dotenv').config();
const mysql = require('mysql2');

async function setupMySQL() {
    // First connect as root
    const rootConnection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '' // Default empty password for root
    });

    try {
        await rootConnection.promise().query(`
            CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};
            CREATE USER IF NOT EXISTS '${process.env.DB_USER}'@'localhost' IDENTIFIED BY '${process.env.DB_PASSWORD}';
            GRANT ALL PRIVILEGES ON ${process.env.DB_NAME}.* TO '${process.env.DB_USER}'@'localhost';
            FLUSH PRIVILEGES;
        `);
        console.log('Database and user created successfully');
        
        // Test new user connection
        const userConnection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        await userConnection.promise().connect();
        console.log('Test connection successful');
        
        userConnection.end();
        rootConnection.end();
    } catch (error) {
        console.error('Setup failed:', error.message);
        process.exit(1);
    }
}

setupMySQL();
