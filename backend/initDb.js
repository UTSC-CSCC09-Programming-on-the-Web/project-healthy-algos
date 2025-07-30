// backend/initDb.js
import pool from './services/db.js';

export async function initializeDatabase() {
  try {
    const createUsersTableQuery = `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        google_id TEXT UNIQUE NOT NULL,
        name TEXT,
        email TEXT,
        picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        subscribed BOOLEAN DEFAULT FALSE,
        stripe_subscription_id TEXT
      );
    `;

    await pool.query(createUsersTableQuery);
    console.log('Users table checked/created');

    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
    `);
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}
