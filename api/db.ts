import { neon } from '@neondatabase/serverless';

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }
  return neon(connectionString);
}

let tablesInitialized = false;

export async function ensureTablesExist(sql: ReturnType<typeof neon>) {
  if (tablesInitialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS diagnostics (
      id TEXT PRIMARY KEY,
      startup_name TEXT,
      tagline TEXT,
      sector TEXT,
      region TEXT,
      stage TEXT,
      women_led BOOLEAN DEFAULT true,
      field_a TEXT,
      field_b TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      diagnostic_id TEXT,
      grant_id TEXT,
      grant_name TEXT,
      funder TEXT,
      total_grant_usd NUMERIC,
      tranches JSONB,
      share_slug TEXT UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  tablesInitialized = true;
}
