import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyBotState, type BotDependencies, type TelegramUpdate } from '../src/lib/telegram/bot';
import { createCloudBotStore, type CloudBotState, type CloudBotStore } from '../src/lib/telegram/cloud-store';
import { isWebhookAuthorized, parseTelegramUpdate, readWebhookBody, runCloudUpdate } from '../src/lib/telegram/webhook';
import { TelegramTransportError } from '../src/lib/telegram/transport';

const now = Date.UTC(2026, 9, 6);
const update = (id: number): TelegramUpdate => ({ update_id: id, message: { message_id: id, date: now / 1000, text: 'What is self-inquiry?', from: { id: 50 }, chat: { id: 50, type: 'private' } } });
function fixture() {
  let value: CloudBotState = { state: emptyBotState(), completed: [] };
  let lease: string | null = null;
  const sent: string[] = [];
  let answers = 0;
  const store: CloudBotStore = {
    claim: async (owner) => { if (lease) return null; lease = owner; return structuredClone(value); },
    save: async (owner, data) => { assert.equal(owner, lease); value = structuredClone(data); },
    release: async (owner) => { if (lease === owner) lease = null; },
  };
  const deps: Omit<BotDependencies, 'save'> = { now: () => now, dailyLimit: 30, globalDailyLimit: 300,
    typing: async () => undefined, send: async (_chat, text) => { sent.push(text); },
    answer: async () => { answers++; return 'Notice what is aware of the thought.'; },
  };
  return { store, deps, sent, state: () => value, answerCount: () => answers };
}

test('webhook authentication and shape/size checks reject untrusted input', async () => {
  assert.equal(isWebhookAuthorized(null, 'secret'), false);
  assert.equal(isWebhookAuthorized('wrong', 'secret'), false);
  assert.equal(isWebhookAuthorized('secret', 'secret'), true);
  assert.equal(parseTelegramUpdate({ update_id: 1, message: { chat: {} } }), null);
  assert.equal(parseTelegramUpdate({ update_id: -1 }), null);
  assert.ok(parseTelegramUpdate(update(1)));
  await assert.rejects(readWebhookBody(new Request('https://example.com', { method: 'POST', body: 'x'.repeat(65_537) })), /too large/);
});

test('cloud retries deduplicate and out-of-order webhook updates are not lost', async () => {
  const f = fixture();
  assert.equal(await runCloudUpdate(update(20), f.store, f.deps), 'done');
  assert.equal(await runCloudUpdate(update(20), f.store, f.deps), 'done');
  assert.equal(await runCloudUpdate(update(19), f.store, f.deps), 'done');
  assert.equal(f.answerCount(), 2);
  assert.equal(f.sent.length, 2);
  assert.deepEqual(f.state().completed, [20, 19]);
  assert.equal(f.state().state.usage['50'].count, 2);
});

test('saved cloud outbox resumes after delivery failure without generating another answer', async () => {
  const f = fixture();
  const originalSend = f.deps.send;
  f.deps.send = async () => { throw new TelegramTransportError(0); };
  await assert.rejects(runCloudUpdate(update(10), f.store, f.deps), /delivery failed/);
  assert.ok(f.state().state.pending?.answer);
  f.deps.send = originalSend;
  assert.equal(await runCloudUpdate(update(10), f.store, f.deps), 'done');
  assert.equal(f.answerCount(), 1);
  assert.equal(f.sent.length, 1);
  assert.equal(f.state().state.pending, undefined);
});

test('concurrent invocations cannot spend quota or deliver twice', async () => {
  const f = fixture();
  let finishAnswer!: (answer: string) => void;
  f.deps.answer = () => new Promise((resolve) => { finishAnswer = resolve; });
  const first = runCloudUpdate(update(3), f.store, f.deps);
  while (!finishAnswer) await new Promise((resolve) => setImmediate(resolve));
  assert.equal(await runCloudUpdate(update(3), f.store, f.deps), 'busy');
  finishAnswer('One answer.');
  assert.equal(await first, 'done');
  assert.equal(f.sent.length, 1);
  assert.equal(f.state().state.globalUsage.count, 1);
});

test('an undeliverable old outbox does not acknowledge and lose a newer question', async () => {
  const f = fixture();
  f.deps.send = async () => { throw new TelegramTransportError(0); };
  await assert.rejects(runCloudUpdate(update(1), f.store, f.deps));
  f.deps.send = async () => { throw new TelegramTransportError(403); };
  assert.equal(await runCloudUpdate(update(2), f.store, f.deps), 'busy');
  assert.deepEqual(f.state().completed, [1]);
  f.deps.send = async (_id, text) => { f.sent.push(text); };
  assert.equal(await runCloudUpdate(update(2), f.store, f.deps), 'done');
  assert.equal(f.answerCount(), 2);
});

test('cloud storage errors are sanitized and expired owners cannot save', async () => {
  const before = { fetch: globalThis.fetch, url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY };
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-private-key';
  try {
    globalThis.fetch = async () => Response.json(false);
    await assert.rejects(createCloudBotStore().save('owner', { state: emptyBotState(), completed: [] }), /lease expired/);
    globalThis.fetch = async () => { throw new Error('secret raw error'); };
    await assert.rejects(createCloudBotStore().claim('owner'), (error: Error) => !error.message.includes('secret'));
  } finally {
    globalThis.fetch = before.fetch;
    if (before.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = before.url;
    if (before.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = before.key;
  }
});
