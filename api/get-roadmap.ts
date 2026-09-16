import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, ensureTablesExist } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing required query parameter: id' });
    }

    const sql = getDb();
    await ensureTablesExist(sql);

    const rows = await sql`
      SELECT 
        r.id,
        r.grant_id,
        r.grant_name,
        r.funder,
        r.total_grant_usd,
        r.tranches,
        r.share_slug,
        r.created_at,
        d.id as diag_id,
        d.startup_name,
        d.tagline,
        d.sector,
        d.region,
        d.stage,
        d.women_led,
        d.field_a,
        d.field_b
      FROM roadmaps r
      LEFT JOIN diagnostics d ON r.diagnostic_id = d.id
      WHERE r.id = ${id} OR r.share_slug = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Roadmap not found.' });
    }

    const row = rows[0];

    const responseData = {
      id: row.id,
      grantId: row.grant_id,
      grantName: row.grant_name,
      funder: row.funder,
      totalGrantUsd: Number(row.total_grant_usd),
      tranches: typeof row.tranches === 'string' ? JSON.parse(row.tranches) : row.tranches,
      createdAt: row.created_at,
      diagnostic: row.diag_id
        ? {
            id: row.diag_id,
            startupName: row.startup_name,
            tagline: row.tagline,
            sector: row.sector,
            region: row.region,
            stage: row.stage,
            womenLed: row.women_led,
            fieldA: row.field_a,
            fieldB: row.field_b,
          }
        : null,
    };

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Error fetching roadmap:', error);
    return res.status(500).json({
      error: 'Failed to retrieve roadmap from database.',
      details: error?.message || String(error),
    });
  }
}
