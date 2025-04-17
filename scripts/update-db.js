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

        // Check if columns already exist
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' 
            AND TABLE_SCHEMA = 'securepass'
        `);

        const columnNames = columns.map(col => col.COLUMN_NAME);

        if (!columnNames.includes('verification_token')) {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN verification_token VARCHAR(64)
            `);
            console.log('Added verification_token column');
        }

        if (!columnNames.includes('is_verified')) {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN is_verified BOOLEAN DEFAULT false
            `);
            console.log('Added is_verified column');
        }

        console.log('Database update completed successfully!');

    } catch (error) {
        console.error('Error updating database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

updateDatabase();
