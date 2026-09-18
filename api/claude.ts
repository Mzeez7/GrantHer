import { Anthropic } from '@anthropic-ai/sdk';

export function getAnthropicClient(): { client: Anthropic; model: string } {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not configured.');
  }

  const client = new Anthropic({ apiKey });
  
  // Use primary model configured or Sonnet 4.5
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';

  return { client, model };
}
