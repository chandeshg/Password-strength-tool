require('dotenv').config();
const mysql = require('mysql2');

async function testConnection() {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        await connection.promise().connect();
        console.log('Application user connection successful');
        
        // Create additional required tables
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS password_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                password_hash VARCHAR(255) NOT NULL,
                strength_score INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        
        // Verify table structures
        const [tables] = await connection.promise().query('SHOW TABLES');
        console.log('Available tables:', tables.map(row => Object.values(row)[0]));
        
        // Check table columns
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [columns] = await connection.promise().query(`DESCRIBE ${tableName}`);
            console.log(`\nTable '${tableName}' structure:`);
            console.log(columns.map(col => `${col.Field} (${col.Type})`).join('\n'));
        }
        
        connection.end();
    } catch (error) {
        console.error('Connection test failed:', error.message);
        process.exit(1);
    }
}

testConnection();
