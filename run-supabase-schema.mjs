import { Client } from 'pg';
import fs from 'fs';

// Supabase connection credentials from CEO/board
const connectionString = process.argv[2] || process.env.SUPABASE_CONNECTION_STRING;

if (!connectionString) {
  console.error('Usage: node run-supabase-schema.mjs <connection_string>');
  console.error('Example: node run-supabase-schema.mjs postgresql://postgres:password@db.project.supabase.co:5432/postgres');
  process.exit(1);
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    const sql = fs.readFileSync('./supabase/schema.sql', 'utf8');
    await client.connect();
    console.log('Connected to Supabase.');

    await client.query(sql);

    console.log('Schema applied successfully.');
    console.log('');
    console.log('Verifying tables...');
    const tables = await client.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"
    );
    for (const row of tables.rows) {
      console.log('  -', row.tablename);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
