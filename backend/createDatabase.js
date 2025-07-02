// backend/createDatabase.js
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

export async function createDatabaseIfNotExists() {
  const targetDbName = process.env.DB_NAME || 'isim';

  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: 'postgres', // must connect to a system DB, not the target DB
  });

  try {
    await adminClient.connect();

    // Check if DB exists
    const checkRes = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (checkRes.rowCount === 0) {
      console.log(`🔧 Creating database "${targetDbName}"...`);
      await adminClient.query(`CREATE DATABASE ${targetDbName}`);
      console.log(`Database "${targetDbName}" created.`);
    } else {
      console.log(`Database "${targetDbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await adminClient.end();
  }
}
