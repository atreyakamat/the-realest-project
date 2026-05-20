import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('Missing database connection string. Set SUPABASE_DB_URL, DATABASE_URL, or POSTGRES_URL.');
  process.exit(1);
}

const migrationPath = resolve(process.cwd(), 'db/migrations/001_init.sql');
const seedPath = resolve(process.cwd(), 'db/seeds/seed.sql');
const sql = `${readFileSync(migrationPath, 'utf8')}\n\n${readFileSync(seedPath, 'utf8')}`;

const result = spawnSync('psql', ['--dbname', databaseUrl, '--set', 'ON_ERROR_STOP=1'], {
  input: sql,
  encoding: 'utf8',
  stdio: ['pipe', 'inherit', 'inherit'],
});

if (result.error) {
  console.error('Failed to start psql:', result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('Database schema and seed data applied successfully.');
