require('dotenv').config();
const mysql = require('mysql2');
const readline = require('readline');

async function getRootPassword() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter MySQL root password: ', (password) => {
            rl.close();
            resolve(password);
        });
    });
}

async function checkDatabase() {
    const rootPassword = await getRootPassword();
    let connection;

    try {
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: rootPassword
        });

        await connection.promise().connect();
        console.log('Root connection successful');

        // Execute commands separately for better error handling
        try {
            await connection.promise().query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
            console.log('Database created/verified');

            // Drop user if exists and create new
            await connection.promise().query(`DROP USER IF EXISTS '${process.env.DB_USER}'@'localhost'`);
            await connection.promise().query(`CREATE USER '${process.env.DB_USER}'@'localhost' IDENTIFIED BY '${process.env.DB_PASSWORD}'`);
            console.log('User created');

            await connection.promise().query(`GRANT ALL PRIVILEGES ON ${process.env.DB_NAME}.* TO '${process.env.DB_USER}'@'localhost'`);
            await connection.promise().query('FLUSH PRIVILEGES');
            console.log('Privileges granted');

            await connection.promise().query(`USE ${process.env.DB_NAME}`);
            
            // Create tables
            await connection.promise().query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Tables created successfully');
            console.log('Setup completed successfully');
        } catch (sqlError) {
            console.error('SQL Error:', sqlError.message);
        }
    } catch (error) {
        console.error('Setup failed:', error.message);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

checkDatabase();
