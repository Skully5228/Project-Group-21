const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create the database if it doesn't exist
async function createDatabaseIfNeeded() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  await connection.query(`
    CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};
  `);

  connection.end();
}

// Run the function to ensure the database exists
createDatabaseIfNeeded()
  .then(() => console.log('Database is ready'))
  .catch((err) => console.error('Error creating database:', err));

module.exports = pool;
