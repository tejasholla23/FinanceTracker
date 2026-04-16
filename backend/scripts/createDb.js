require('dotenv').config();
const { Client } = require('pg');

const createDatabase = async () => {
  // Connect to the default 'postgres' database to issue the CREATE DATABASE command
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Default DB
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL Server.');
    
    const dbName = process.env.DB_NAME || 'finance_tracker';
    
    // Check if db exists
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}";`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    } else {
      console.log(`ℹ️ Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('❌ Error creating database:', err.message);
  } finally {
    await client.end();
  }
};

createDatabase();
