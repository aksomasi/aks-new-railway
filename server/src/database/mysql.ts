import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'dive_thru',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const db = mysql.createPool(dbConfig);

// Test connection
db.getConnection()
  .then(connection => {
    console.log('✅ MySQL connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });

export default db;