import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, ensureTablesExist } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sql = getDb();
    await ensureTablesExist(sql);
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name;`;

    return res.status(200).json({
      status: 'healthy',
      database: 'Neon Postgres',
      connectedAt: result[0]?.current_time,
      databaseName: result[0]?.db_name,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'unhealthy',
      error: error?.message || String(error),
      hint: 'Please ensure DATABASE_URL is set in your Vercel or local .env environment variables.'
    });
  }
}
