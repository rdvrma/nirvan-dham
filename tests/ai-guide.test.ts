import test from 'node:test';
import assert from 'node:assert/strict';
import { generateGuideAnswer, GuideError } from '../src/lib/ai-guide/answer';

test('shared guide keeps website budget and applies bot depth and Hindi repair', async () => {
  const savedFetch = globalThis.fetch;
  const savedKey = process.env.SARVAM_API_KEY;
  process.env.SARVAM_API_KEY = 'test-only-key';
  const bodies: { max_tokens: number; messages: { role: string; content: string }[] }[] = [];
  let output = 'A clear answer about awareness.';
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options!.body as string);
    bodies.push(body);
    const answer = body.messages[0].content.startsWith('Rewrite') ? 'यह जागरूकता का सरल उत्तर है।' : output;
    return Response.json({ choices: [{ message: { content: answer } }] });
  };
  try {
    await generateGuideAnswer({ question: 'What is awareness?', lang: 'en' });
    assert.equal(bodies.at(-1)!.max_tokens, 850);
    await generateGuideAnswer({ question: 'What is awareness?', lang: 'en', depth: 'detailed' });
    assert.equal(bodies.at(-1)!.max_tokens, 2400);
    assert.match(bodies.at(-1)!.messages[0].content, /350–550/);
    await generateGuideAnswer({ question: 'What is awareness?', lang: 'en', depth: 'short' });
    assert.equal(bodies.at(-1)!.max_tokens, 300);
    output = 'Yeh sakshi bhav ko samajhne ka simple tareeka hai.';
    const hindi = await generateGuideAnswer({ question: 'sakshi bhav kya hai?', lang: 'hi', depth: 'detailed' });
    assert.equal(hindi, 'यह जागरूकता का सरल उत्तर है।');
    assert.equal(bodies.at(-1)!.max_tokens, 2600);
  } finally {
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) delete process.env.SARVAM_API_KEY; else process.env.SARVAM_API_KEY = savedKey;
  }
});

test('provider failures are sanitized and retain website status codes', async () => {
  const savedFetch = globalThis.fetch;
  const savedKey = process.env.SARVAM_API_KEY;
  process.env.SARVAM_API_KEY = 'test-only-key';
  try {
    globalThis.fetch = async () => new Response('{}', { status: 429 });
    await assert.rejects(generateGuideAnswer({ question: 'meditation?', lang: 'en' }), (error: unknown) => error instanceof GuideError && error.status === 429);
    globalThis.fetch = async () => Response.json({ choices: [] });
    await assert.rejects(generateGuideAnswer({ question: 'meditation?', lang: 'en' }), (error: unknown) => error instanceof GuideError && error.status === 502);
    globalThis.fetch = async () => { throw new Error('private-provider-key'); };
    await assert.rejects(generateGuideAnswer({ question: 'meditation?', lang: 'en' }), (error: unknown) => error instanceof GuideError && error.status === 503 && !error.message.includes('private-provider-key'));
  } finally {
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) delete process.env.SARVAM_API_KEY; else process.env.SARVAM_API_KEY = savedKey;
  }
});
