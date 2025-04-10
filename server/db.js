const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Change to your MySQL username
    password: '', // Change to your MySQL password
    database: 'securepass',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
