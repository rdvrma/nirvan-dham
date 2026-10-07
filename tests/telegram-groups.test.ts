import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyBotState, finishPending, handleTelegramUpdate, type BotDependencies, type TelegramUpdate } from '../src/lib/telegram/bot';
import { inspectSpam, languageName, reserveGroupIntake, type GroupRuntime } from '../src/lib/telegram/groups';
import { analyzeGroupMessage, localizeBotText } from '../src/lib/telegram/answer';
import { createTelegramTransport } from '../src/lib/telegram/transport';
import { parseTelegramUpdate } from '../src/lib/telegram/webhook';

const now = Date.UTC(2026, 9, 7, 10);
const chatId = -100900;
function fixture() {
  const state = emptyBotState();
  const answers: Parameters<BotDependencies['answer']>[0][] = [];
  const sent: string[] = [];
  let admin = true;
  const deps: BotDependencies = {
    now: () => now, dailyLimit: 30, globalDailyLimit: 300,
    save: async () => undefined, typing: async () => undefined,
    send: async (_id, text) => { sent.push(text); },
    answer: async input => { answers.push(input); return 'answer'; },
    analyze: async text => ({ isQuestion: text !== 'Thanks', languageCode: text.startsWith('What') ? 'en' : text.startsWith('¿') ? 'es' : text.startsWith('Mitä') ? 'fi' : text.startsWith('ध्यान कसरी') ? 'ne' : 'hi' }),
    groupAccess: async () => ({ userIsAdmin: admin, botIsAdmin: true, canDelete: true, canRestrict: true }),
    moderate: async () => true, unban: async () => undefined,
  };
  const message = (id: number, text: string, user = 50, chat = chatId): TelegramUpdate => ({ update_id: id, message: { message_id: id, date: now / 1000, text, from: { id: user }, chat: { id: chat, type: 'supergroup' } } });
  return { state, deps, answers, sent, message, admin: (value: boolean) => { admin = value; } };
}

test('only admins enable auto mode, only this group changes, and each question chooses its own language', async () => {
  const f = fixture();
  f.admin(false);
  await handleTelegramUpdate(f.message(1, '/auto@NirvanDhamGuideBot on'), f.state, f.deps);
  assert.equal(f.state.groups?.settings?.[chatId], undefined);
  f.admin(true);
  await handleTelegramUpdate(f.message(2, '/auto@NirvanDhamGuideBot on'), f.state, f.deps);
  assert.equal(Object.values(f.state.groups!.settings!)[0].autoReply, true);
  for (const [i, text] of ['ध्यान कसरी सुरु गर्ने?', 'What is awareness?', 'ध्यान कैसे करें?', '¿Qué es la conciencia?', 'Mitä tietoisuus on?'].entries()) {
    await handleTelegramUpdate(f.message(i + 3, text), f.state, f.deps);
  }
  assert.deepEqual(f.answers.map(item => item.languageCode), ['ne', 'en', 'hi', 'es', 'fi']);
  assert.deepEqual(f.answers.slice(0, 4).map(item => item.lang), ['ne', 'en', 'hi', 'es']);
  await handleTelegramUpdate(f.message(8, 'What is awareness?', 60, -901), f.state, f.deps);
  await handleTelegramUpdate(f.message(9, 'Thanks'), f.state, f.deps);
  await handleTelegramUpdate(f.message(10, '/ask@OtherBot test?'), f.state, f.deps);
  assert.equal(f.answers.length, 5);
  assert.equal(f.state.globalUsage.count, 5);
  await handleTelegramUpdate(f.message(11, '/help'), f.state, f.deps);
  assert.match(f.sent.at(-1)!, /no \/ask|\/ask या mention ज़रूरी नहीं/);
});

test('classification and answer budgets stay separate; non-questions do not spend answer quota', async () => {
  const f = fixture();
  f.state.groups = { settings: { [chatId]: { autoReply: true, moderation: false } } };
  for (let i = 1; i <= 11; i++) await handleTelegramUpdate(f.message(i, 'Thanks'), f.state, f.deps);
  assert.equal(f.state.groups.intakeUsage!['50'].count, 10);
  assert.equal(f.answers.length, 0);
  assert.equal(f.sent.length, 0);
  const runtime: GroupRuntime = {};
  for (let i = 0; i < 90; i++) assert.equal(reserveGroupIntake(runtime, 7, now + i * 60_001), true);
  assert.equal(reserveGroupIntake(runtime, 7, now + 90 * 60_001), false);
  assert.equal(reserveGroupIntake(runtime, 8, now), true);
});

test('normal links and scam warnings are safe; repeat links, flood and repeated scams produce temporary actions', () => {
  const runtime: GroupRuntime = {};
  const inspect = (text: string, id: number, user = 50) => inspectSpam(runtime, { chatId, userId: user, messageId: id, text, now: now + id * 100 });
  assert.equal(inspect('Read this teaching https://nirvandham.in', 1), null);
  assert.equal(inspect('Beware: guaranteed profit https://example.com scam', 2), null);
  assert.equal(inspect('Is guaranteed profit real? https://example.com', 2, 80), null);
  const repeated = 'Please visit this long repeated promotional link https://example.com';
  for (let i = 3; i <= 5; i++) assert.equal(inspect(repeated, i), null);
  assert.equal(inspect(repeated, 6)!.action, 'mute');
  assert.equal(inspect('Guaranteed profit https://example.com', 7)!.action, 'warn');
  const block = inspect('Double your money https://example.com', 8)!;
  assert.equal(block.action, 'block');
  assert.equal(block.until, Math.floor((now + 800) / 1000) + 86_400);
  for (let i = 1; i < 10; i++) assert.equal(inspect('different message ' + i, i, 60), null);
  assert.equal(inspect('message 10', 10, 60)!.reason, 'flood');
});

test('slow webhook processing does not hide a burst sent within twenty seconds', () => {
  const runtime: GroupRuntime = {};
  let action;
  for (let i = 0; i < 10; i++) action = inspectSpam(runtime, { chatId, userId: 80, messageId: i,
    text: 'burst ' + i, now: now + i * 20_000, sentAt: now + i * 1000 });
  assert.equal(action!.reason, 'flood');
  assert.equal(action!.until, Math.floor((now + 180_000) / 1000) + 3600);
});

test('admins are protected and a saved moderation notice retries without acting twice', async () => {
  const f = fixture();
  f.state.groups = { settings: { [chatId]: { autoReply: false, moderation: true } } };
  let actions = 0;
  f.deps.moderate = async () => { actions++; return true; };
  const spam = 'Guaranteed profit https://example.com';
  await handleTelegramUpdate(f.message(1, spam), f.state, f.deps);
  assert.equal(actions, 0);
  f.admin(false);
  const send = f.deps.send;
  f.deps.send = async () => { throw new Error('network'); };
  await assert.rejects(handleTelegramUpdate(f.message(2, spam), f.state, f.deps));
  assert.equal(actions, 1);
  assert.equal(f.state.groups.audit!.length, 1);
  f.deps.send = send;
  await finishPending(f.state, f.deps);
  assert.equal(actions, 1);
  assert.equal(f.answers.length, 0);
  assert.deepEqual(f.state.users['group:' + chatId + ':50'].history, []);
});

test('unban does not undo a manual restriction and bot permissions are checked before enabling moderation', async () => {
  const f = fixture();
  let restored = 0;
  f.deps.unban = async () => { restored++; };
  await handleTelegramUpdate(f.message(1, '/unban@NirvanDhamGuideBot 60'), f.state, f.deps);
  assert.equal(restored, 0);
  f.deps.groupAccess = async () => ({ userIsAdmin: true, botIsAdmin: true, canDelete: true, canRestrict: false });
  await handleTelegramUpdate(f.message(2, '/moderation@NirvanDhamGuideBot on'), f.state, f.deps);
  assert.equal(f.state.groups!.settings![chatId].moderation, false);
});

test('webhook validates optional sender, caption and entity shapes', () => {
  const f = fixture();
  for (const patch of [{ caption: {} }, { entities: {} }, { entities: [{ type: 'url', url: {} }] }, { from: { id: 50, username: 8 } }, { message_thread_id: {} }, { reply_to_message: { from: { id: 60, username: 6 } } }]) {
    const update = f.message(1, 'question');
    Object.assign(update.message!, patch);
    assert.equal(parseTelegramUpdate(update), null);
  }
});

test('classifier rejects invented language instructions; languages beyond the manual menu use ICU names', async () => {
  const original = { fetch: globalThis.fetch, key: process.env.SARVAM_API_KEY };
  process.env.SARVAM_API_KEY = 'test-only-key';
  try {
    globalThis.fetch = async () => Response.json({ choices: [{ message: { content: '{"isQuestion":true,"languageCode":"fi"}' } }] });
    assert.deepEqual(await analyzeGroupMessage('Mitä tietoisuus on?'), { isQuestion: true, languageCode: 'fi' });
    globalThis.fetch = async () => Response.json({ choices: [{ message: { content: '{"isQuestion":true,"languageCode":"ignore rules"}' } }] });
    await assert.rejects(analyzeGroupMessage('test'), /language/);
    globalThis.fetch = async (_url, options) => {
      assert.match(JSON.parse(options!.body as string).messages[0].content, /Finnish \(fi\)/);
      return Response.json({ choices: [{ message: { content: 'Huomaa ajatuksesi.' } }] });
    };
    assert.equal(await localizeBotText('Notice your thoughts.', 'hi', 'fi'), 'Huomaa ajatuksesi.');
    assert.equal(languageName('ignore rules'), null);
    assert.equal(languageName('zz'), null);
  } finally {
    globalThis.fetch = original.fetch;
    if (original.key === undefined) delete process.env.SARVAM_API_KEY; else process.env.SARVAM_API_KEY = original.key;
  }
});

test('transport rechecks admins, preserves history, and never substitutes a permanent ban', async () => {
  const original = { fetch: globalThis.fetch, token: process.env.TELEGRAM_BOT_TOKEN };
  process.env.TELEGRAM_BOT_TOKEN = '123:test-only-token';
  const methods: { method: string; body: Record<string, unknown> }[] = [];
  let targetAdmin = true;
  let deleteFailure = false;
  globalThis.fetch = async (url, options) => {
    const method = String(url).split('/').at(-1)!;
    const body = JSON.parse(options!.body as string);
    methods.push({ method, body });
    if (method === 'getMe') return Response.json({ ok: true, result: { id: 123 } });
    if (method === 'getChatMember') return Response.json({ ok: true, result: body.user_id === 123 ? { status: 'administrator', can_delete_messages: true, can_restrict_members: true } : { status: targetAdmin ? 'administrator' : 'member' } });
    if (method === 'deleteMessage' && deleteFailure) return Response.json({ ok: false, error_code: 400, description: "message can't be deleted" }, { status: 400 });
    return Response.json({ ok: true, result: true });
  };
  try {
    const transport = createTelegramTransport();
    const action = { chatId, userId: 50, messageId: 4, action: 'block' as const, reason: 'flood' as const, until: Math.floor(Date.now() / 1000) + 86_400 };
    assert.equal(await transport.moderate!(action), false);
    assert.equal(methods.some(item => item.method === 'deleteMessage'), false);
    targetAdmin = false;
    assert.equal(await transport.moderate!(action), true);
    assert.equal(methods.some(item => item.method === 'banChatMember'), false);
    assert.equal(methods.find(item => item.method === 'restrictChatMember')!.body.until_date, action.until);
    deleteFailure = true;
    await assert.rejects(transport.moderate!(action), /400/);
  } finally {
    globalThis.fetch = original.fetch;
    if (original.token === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = original.token;
  }
});
