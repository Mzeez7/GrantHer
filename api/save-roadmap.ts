import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, ensureTablesExist } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for local testing / production
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { diagnostic, roadmap, grantName, funder, totalGrantUsd, grantId } = req.body;

    if (!roadmap || !Array.isArray(roadmap)) {
      return res.status(400).json({ error: 'Invalid payload: roadmap array is required.' });
    }

    const sql = getDb();
    await ensureTablesExist(sql);

    const diagnosticId = diagnostic?.id || `diag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const roadmapId = `gh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Persist diagnostic record if provided
    if (diagnostic) {
      await sql`
        INSERT INTO diagnostics (
          id, startup_name, tagline, sector, region, stage, women_led, field_a, field_b
        ) VALUES (
          ${diagnosticId},
          ${diagnostic.startupName || 'Untitled Venture'},
          ${diagnostic.tagline || ''},
          ${diagnostic.sector || ''},
          ${diagnostic.region || ''},
          ${diagnostic.stage || ''},
          ${diagnostic.womenLed ?? true},
          ${diagnostic.fieldA || ''},
          ${diagnostic.fieldB || ''}
        )
        ON CONFLICT (id) DO UPDATE SET
          startup_name = EXCLUDED.startup_name,
          tagline = EXCLUDED.tagline,
          sector = EXCLUDED.sector,
          region = EXCLUDED.region,
          stage = EXCLUDED.stage,
          women_led = EXCLUDED.women_led,
          field_a = EXCLUDED.field_a,
          field_b = EXCLUDED.field_b;
      `;
    }

    // Persist roadmap record
    await sql`
      INSERT INTO roadmaps (
        id, diagnostic_id, grant_id, grant_name, funder, total_grant_usd, tranches, share_slug
      ) VALUES (
        ${roadmapId},
        ${diagnostic ? diagnosticId : null},
        ${grantId || 'custom-grant'},
        ${grantName || 'Grant Allocation Roadmap'},
        ${funder || 'Grant Committee'},
        ${totalGrantUsd || 100000},
        ${JSON.stringify(roadmap)},
        ${roadmapId}
      );
    `;

    return res.status(200).json({
      success: true,
      id: roadmapId,
      shareSlug: roadmapId,
      message: 'Roadmap persisted successfully to Neon Postgres.'
    });
  } catch (error: any) {
    console.error('Error saving roadmap:', error);
    return res.status(500).json({
      error: 'Failed to save roadmap to database.',
      details: error?.message || String(error)
    });
  }
}
