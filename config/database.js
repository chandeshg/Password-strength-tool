const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '4444',  // Make sure this matches your MySQL password
    database: 'password_tool',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Add connection test
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connected successfully');
        connection.release();
    }
});

const promisePool = pool.promise();
module.exports = promisePool;
