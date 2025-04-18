const mysql = require('mysql2/promise');

async function updateDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '4444',
            database: 'securepass'
        });

        console.log('Connected to database');

        // Check if columns exist
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' 
            AND TABLE_SCHEMA = 'securepass'
        `);

        const columnNames = columns.map(col => col.COLUMN_NAME);

        // Add reset_token if it doesn't exist
        if (!columnNames.includes('reset_token')) {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN reset_token VARCHAR(64)
            `);
            console.log('Added reset_token column');
        }

        // Add reset_expires if it doesn't exist
        if (!columnNames.includes('reset_expires')) {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN reset_expires DATETIME
            `);
            console.log('Added reset_expires column');
        }

        console.log('Database update completed successfully!');

    } catch (error) {
        console.error('Error updating database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

updateDatabase();
