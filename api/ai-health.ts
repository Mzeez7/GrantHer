import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAnthropicClient } from './claude.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    const keyPreview = hasKey ? `${process.env.ANTHROPIC_API_KEY?.slice(0, 10)}...` : 'NOT_SET';

    if (!hasKey) {
      return res.status(500).json({
        status: 'error',
        aiConnected: false,
        message: 'ANTHROPIC_API_KEY is not set in Vercel Environment Variables. Please add ANTHROPIC_API_KEY in Vercel Settings -> Environment Variables and redeploy.',
      });
    }

    const { client, model } = getAnthropicClient();
    const testPing = await client.messages.create({
      model,
      max_tokens: 15,
      messages: [{ role: 'user', content: 'Ping' }],
    });

    return res.status(200).json({
      status: 'healthy',
      aiConnected: true,
      model,
      keyPreview,
      response: testPing.content[0]?.type === 'text' ? testPing.content[0].text : 'OK',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      aiConnected: false,
      error: error?.message || String(error),
      hint: 'Verify ANTHROPIC_API_KEY in Vercel project settings -> Environment Variables.',
    });
  }
}
