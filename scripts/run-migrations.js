const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Hard-code the connection string (migrations only — not committed)
const connectionString =
  'postgresql://postgres:0hllqQeMkAWRb5MI@db.txromsjsocbpinfzwqzi.supabase.co:5432/postgres';

async function runMigrations() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected to Supabase Postgres.');

    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`Running migration: ${file} ...`);
      try {
        await client.query(sql);
        console.log(`  OK: ${file}`);
      } catch (err) {
        // If object already exists, warn and continue
        if (err.message && /already exists/i.test(err.message)) {
          console.log(`  WARN: ${file} — ${err.message} (skipping)`);
        } else {
          console.error(`  FAILED: ${file} — ${err.message}`);
          throw err;
        }
      }
    }

    console.log('All migrations applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
