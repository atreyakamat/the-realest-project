import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith('--')) continue;
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args.set(current.slice(2), next);
      i += 1;
    } else {
      args.set(current.slice(2), 'true');
    }
  }
  return args;
}

function printUsage() {
  console.log(`Usage:
  node scripts/apply-migration-003.mjs --tool psql --database-url <url>
  node scripts/apply-migration-003.mjs --tool supabase --database-url <url>

Environment:
  DATABASE_URL            Postgres connection string (required for psql)
  SUPABASE_DB_URL         Alternate Postgres connection string
  SUPABASE_CLI_PATH       Optional custom path to the supabase CLI binary

Defaults:
  --tool defaults to psql
  --migration defaults to db/migrations/003_ai_drip_pwa_leaderboard.sql`);
}

const args = parseArgs(process.argv.slice(2));
if (args.has('help') || args.has('h')) {
  printUsage();
  process.exit(0);
}

const tool = (args.get('tool') ?? 'psql').toLowerCase();
const migrationPath = resolve(process.cwd(), args.get('migration') ?? 'db/migrations/003_ai_drip_pwa_leaderboard.sql');
const databaseUrl = args.get('database-url') ?? process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? '';

if (!existsSync(migrationPath)) {
  console.error(`Migration file not found: ${migrationPath}`);
  process.exit(1);
}

if (!databaseUrl) {
  console.error('Missing DATABASE_URL or SUPABASE_DB_URL.');
  process.exit(1);
}

let command;
let commandArgs;

if (tool === 'supabase') {
  command = process.env.SUPABASE_CLI_PATH ?? 'supabase';
  commandArgs = ['db', 'push', '--db-url', databaseUrl, '--include-all'];
} else {
  command = 'psql';
  commandArgs = [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-f', migrationPath];
}

const result = spawnSync(command, commandArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
