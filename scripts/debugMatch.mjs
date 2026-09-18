import fs from 'fs';
import { Anthropic } from '@anthropic-ai/sdk';

const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) process.env[k.trim()] = v.join('=').trim();
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const grants = JSON.parse(fs.readFileSync('./src/data/grants.json', 'utf8'));

async function test() {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    system: 'You are a grant matcher. Use tool output_matched_grants to return matches.',
    messages: [{ role: 'user', content: 'Match this Web3 startup with grants: ' + JSON.stringify(grants.slice(0, 5)) }],
    tools: [
      {
        name: 'output_matched_grants',
        description: 'Output scored and evaluated grant matches for the founder',
        input_schema: {
          type: 'object',
          properties: {
            matches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  matchScore: { type: 'number' },
                  matchedCriteria: { type: 'array', items: { type: 'string' } },
                  blindspotAlert: { type: 'string' }
                },
                required: ['id', 'matchScore', 'matchedCriteria', 'blindspotAlert']
              }
            }
          },
          required: ['matches']
        }
      }
    ],
    tool_choice: { type: 'tool', name: 'output_matched_grants' }
  });

  console.log('Stop reason:', res.stop_reason);
  console.log('Content blocks:', res.content.map(c => ({ type: c.type, name: c.name, input: c.input })));
}
test().catch(console.error);
