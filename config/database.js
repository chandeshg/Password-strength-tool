const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',          // Your MySQL username (default is root)
    password: '',          // Your MySQL password
    database: 'securepass',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
