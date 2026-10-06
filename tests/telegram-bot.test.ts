import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyBotState, finishPending, handleTelegramUpdate, splitTelegramText, type BotDependencies, type TelegramUpdate } from '../src/lib/telegram/bot';

function fixture() {
  let now = Date.UTC(2026, 9, 6, 12);
  const state = emptyBotState();
  const sent: { id: number; text: string }[] = [];
  const calls: Parameters<BotDependencies['answer']>[0][] = [];
  let disk = '';
  const deps: BotDependencies = {
    dailyLimit: 30, globalDailyLimit: 300, now: () => now,
    save: async () => { disk = JSON.stringify(state); },
    typing: async () => undefined,
    send: async (id, text) => { sent.push({ id, text }); },
    answer: async (input) => { calls.push(input); return `उत्तर: ${input.question}`; },
  };
  const message = (id: number, text: string, chatId = 100): TelegramUpdate => ({ update_id: id, message: { message_id: id + 1000, date: Math.floor(now / 1000), text, chat: { id: chatId, type: 'private' }, from: { id: chatId } } });
  return { state, sent, calls, deps, message, disk: () => disk, advance: (ms: number) => { now += ms; } };
}

test('free start, Hindi detailed defaults, persisted modes and isolated histories', async () => {
  const f = fixture();
  await handleTelegramUpdate(f.message(1, '/start'), f.state, f.deps);
  assert.equal(f.calls.length, 0);
  assert.match(f.sent[0].text, /निःशुल्क/);
  await handleTelegramUpdate(f.message(2, 'साक्षीभाव क्या है?'), f.state, f.deps);
  assert.equal(f.calls[0].depth, 'detailed');
  assert.equal(f.calls[0].lang, 'hi');
  await handleTelegramUpdate(f.message(3, '/english'), f.state, f.deps);
  await handleTelegramUpdate(f.message(4, '/short'), f.state, f.deps);
  await handleTelegramUpdate(f.message(5, 'Explain further'), f.state, f.deps);
  assert.equal(f.calls[1].lang, 'en');
  assert.equal(f.calls[1].depth, 'short');
  assert.equal(f.calls[1].history.length, 2);
  await handleTelegramUpdate(f.message(6, 'ध्यान?', 200), f.state, f.deps);
  assert.deepEqual(f.calls[2].history, []);
  assert.equal(f.calls[2].lang, 'hi');
  const saved = JSON.parse(f.disk());
  assert.equal(saved.users['100'].depth, 'short');
  assert.equal(saved.offset, 7);
});

test('duplicate updates do not generate or send another reply', async () => {
  const f = fixture();
  const update = f.message(1, 'मैं कौन हूँ?');
  await handleTelegramUpdate(update, f.state, f.deps);
  await handleTelegramUpdate(update, f.state, f.deps);
  assert.equal(f.calls.length, 1);
  assert.equal(f.sent.length, 1);
});

test('forget removes memory without resetting daily quota; commands work at quota', async () => {
  const f = fixture();
  f.deps.dailyLimit = 1;
  await handleTelegramUpdate(f.message(1, 'ध्यान?'), f.state, f.deps);
  await handleTelegramUpdate(f.message(2, '/forget'), f.state, f.deps);
  assert.deepEqual(f.state.users['100'].history, []);
  assert.equal(f.state.usage['100'].count, 1);
  await handleTelegramUpdate(f.message(3, 'और बताओ'), f.state, f.deps);
  assert.equal(f.calls.length, 1);
  await handleTelegramUpdate(f.message(4, '/course'), f.state, f.deps);
  assert.match(f.sent.at(-1)!.text, /https:\/\/www.nirvandham.in\/course/);
  f.advance(86_400_000);
  await handleTelegramUpdate(f.message(5, 'ध्यान?'), f.state, f.deps);
  assert.equal(f.calls.length, 2);
});

test('global budget and minute budget bound expensive calls', async () => {
  const f = fixture();
  for (let i = 1; i <= 6; i++) await handleTelegramUpdate(f.message(i, 'ध्यान?'), f.state, f.deps);
  assert.equal(f.calls.length, 5);
  f.advance(60_001);
  f.deps.globalDailyLimit = 5;
  await handleTelegramUpdate(f.message(7, 'ध्यान?', 200), f.state, f.deps);
  assert.equal(f.calls.length, 5);
});

test('groups, bots and oversized/media questions never call AI', async () => {
  const f = fixture();
  const group = f.message(1, 'secret group text');
  group.message!.chat.type = 'group';
  await handleTelegramUpdate(group, f.state, f.deps);
  const bot = f.message(2, 'bot text');
  bot.message!.from!.is_bot = true;
  await handleTelegramUpdate(bot, f.state, f.deps);
  await handleTelegramUpdate(f.message(3, 'x'.repeat(2001)), f.state, f.deps);
  await handleTelegramUpdate(f.message(4, ''), f.state, f.deps);
  assert.equal(f.calls.length, 0);
  assert.equal(f.sent.length, 2);
});

test('saved outbox resumes only unsent chunks after a transport failure', async () => {
  const f = fixture();
  const answer = `${'पहला अनुच्छेद '.repeat(220)}\n\n${'दूसरा अनुच्छेद '.repeat(220)}`;
  f.deps.answer = async (input) => { f.calls.push(input); return answer; };
  const send = f.deps.send;
  let sends = 0;
  f.deps.send = async (...args) => {
    if (++sends === 2) throw new Error('network failed');
    await send(...args);
  };
  await assert.rejects(handleTelegramUpdate(f.message(1, 'विस्तार से समझाएँ'), f.state, f.deps));
  assert.equal(f.state.pending?.nextChunk, 1);
  assert.equal(f.calls.length, 1);
  const restored = JSON.parse(f.disk());
  f.deps.save = async () => undefined;
  f.deps.send = send;
  await finishPending(restored, f.deps);
  assert.equal(f.calls.length, 1);
  assert.equal(f.sent.length, splitTelegramText(answer).length);
  assert.equal(restored.offset, 2);
  assert.equal(restored.users['100'].history.length, 2);
});

test('old histories expire and old offline questions prompt resend', async () => {
  const f = fixture();
  await handleTelegramUpdate(f.message(1, 'ध्यान?'), f.state, f.deps);
  f.advance(8 * 86_400_000);
  const stale = f.message(2, 'और बताओ');
  stale.message!.date -= 700;
  await handleTelegramUpdate(stale, f.state, f.deps);
  assert.deepEqual(f.state.users['100'].history, []);
  assert.equal(f.calls.length, 1);
  assert.match(f.sent.at(-1)!.text, /फिर भेजें/);
});

test('splitting keeps paragraph boundaries, emoji and Telegram limit', () => {
  const input = `${'क'.repeat(3499)}😀${'ख'.repeat(5000)}`;
  const chunks = splitTelegramText(input);
  assert.equal(chunks.join(''), input);
  assert.ok(chunks.every((chunk) => chunk.length <= 3500));
  assert.ok(chunks.every((chunk) => !/[\uD800-\uDBFF]$/.test(chunk)));
});
