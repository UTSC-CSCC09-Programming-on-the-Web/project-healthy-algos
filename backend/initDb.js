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
        subscribed BOOLEAN DEFAULT FALSE
      );
    `;

    await pool.query(createUsersTableQuery);
    console.log('✅ users table checked/created');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
  }
}
