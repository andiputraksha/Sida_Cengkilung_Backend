const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Database configuration:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_desa_adat_cengkilung',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully to:', process.env.DB_NAME);
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('✅ Database query test successful:', rows[0]);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

testConnection().then(success => {
    if (success) {
        console.log('✅ Database module loaded successfully');
    } else {
        console.log('❌ Database module failed to load');
    }
});

// Backward-compatible export:
// 1) `const db = require('../config/db'); db.pool.execute(...)`
// 2) `const pool = require('../config/db'); pool.execute(...)`
const db = {
    pool,
    testConnection,
    execute: (...args) => pool.execute(...args),
    query: (...args) => pool.query(...args),
    getConnection: (...args) => pool.getConnection(...args)
};

module.exports = db;
