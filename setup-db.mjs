import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pg = require('pg');
const { Client } = pg;

console.log('Starting database setup...');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres' // connect to default db first
});

try {
  console.log('Connecting to PostgreSQL...');
  await client.connect();
  console.log('Connected to PostgreSQL');

  // Create the database if it doesn't exist
  console.log('Creating database tree_monitor...');
  await client.query('CREATE DATABASE tree_monitor');
  console.log('Database tree_monitor created');

  await client.end();

  const dbClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'tree_monitor'
  });

  console.log('Connecting to tree_monitor database...');
  await dbClient.connect();
  console.log('Connected to tree_monitor database');

  console.log('Creating tables...');
  // Create tables - simplified version first
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS trees (
      id SERIAL PRIMARY KEY,
      tree_code VARCHAR(50) UNIQUE NOT NULL,
      state VARCHAR(100) NOT NULL,
      state_code VARCHAR(10) NOT NULL,
      district VARCHAR(100) NOT NULL,
      latitude DECIMAL(10,8) NOT NULL,
      longitude DECIMAL(11,8) NOT NULL,
      species VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'planted',
      survival_status VARCHAR(20) DEFAULT 'healthy',
      plantation_date DATE NOT NULL,
      carbon_credits DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Trees table created');

  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      tree_id INTEGER,
      report_type VARCHAR(50) NOT NULL,
      description TEXT,
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      reported_by VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Reports table created');

  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'citizen',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Users table created');

  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS citizens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Citizens table created');

  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS forest_officers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name VARCHAR(255) NOT NULL,
      badge_number VARCHAR(50) UNIQUE,
      state VARCHAR(100),
      district VARCHAR(100),
      phone VARCHAR(20),
      otp_secret VARCHAR(255),
      otp_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Forest officers table created');

  console.log('All tables created successfully');
  await dbClient.end();

} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

