import fs from 'fs';
import https from 'https';
import http from 'http';

const grants = JSON.parse(fs.readFileSync('./src/data/grants.json', 'utf8'));

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeout);
    return {
      status: res.status,
      ok: res.ok,
      finalUrl: res.url,
      redirected: res.redirected
    };
  } catch (err) {
    return {
      status: 'ERR',
      ok: false,
      error: err.message
    };
  }
}

async function run() {
  console.log(`Auditing all ${grants.length} grant URLs...\n`);
  const results = [];
  
  // Process in batches of 5
  for (let i = 0; i < grants.length; i += 5) {
    const batch = grants.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(async (g) => {
      const res = await checkUrl(g.application_url);
      return {
        id: g.id,
        name: g.name,
        originalUrl: g.application_url,
        funder: g.funder,
        ...res
      };
    }));
    results.push(...batchResults);
    process.stdout.write(`Checked ${Math.min(i + 5, grants.length)}/${grants.length}...\r`);
  }

  console.log('\n--- AUDIT RESULTS ---');
  const passing = results.filter(r => r.ok);
  const failing = results.filter(r => !r.ok);

  console.log(`Passing URLs: ${passing.length}/${grants.length}`);
  console.log(`Problematic URLs: ${failing.length}/${grants.length}\n`);

  if (failing.length > 0) {
    console.log('FAILURES:');
    failing.forEach(f => {
      console.log(`- [${f.id}] ${f.name}`);
      console.log(`  URL: ${f.originalUrl}`);
      console.log(`  Status: ${f.status} (${f.error || 'Non-200'})`);
    });
  }

  fs.writeFileSync('./scripts/audit_report.json', JSON.stringify(results, null, 2));
}

run();
