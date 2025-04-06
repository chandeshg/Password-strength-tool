const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost', // Replace with your database host
    user: 'root',      // Replace with your database username
    password: '',      // Replace with your database password
    database: 'password_tool' // Replace with your database name
});

module.exports = db;
