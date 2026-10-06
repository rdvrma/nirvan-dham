import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTelegramAnswer } from '../src/lib/telegram/answer';
import { BOT_LANGUAGES, isBotLanguage, languageKeyboard } from '../src/lib/telegram/languages';
import { emptyBotState, handleTelegramUpdate, type BotDependencies } from '../src/lib/telegram/bot';

test('33 language choices use validated codes and cover both menu pages', () => {
  assert.equal(Object.keys(BOT_LANGUAGES).length, 33);
  const buttons = [...languageKeyboard('global').inline_keyboard.flat(), ...languageKeyboard('more').inline_keyboard.flat()];
  const languages = buttons.filter((button) => button.callback_data.startsWith('lang:'));
  assert.equal(languages.length, 33);
  assert.equal(new Set(languages.map((button) => button.callback_data)).size, 33);
  assert.equal(isBotLanguage('__proto__'), false);
  assert.equal(isBotLanguage('not-a-language'), false);
  assert.ok(languages.every((button) => isBotLanguage(button.callback_data.slice(5))));
});

test('language button callbacks persist selection, acknowledge and avoid paid generation', async () => {
  const state = emptyBotState();
  const replies: string[] = [];
  const callbacks: string[] = [];
  let calls = 0;
  const deps: BotDependencies = {
    now: () => Date.UTC(2026, 9, 6), dailyLimit: 30, globalDailyLimit: 300,
    save: async () => undefined, typing: async () => undefined,
    send: async (_id, text) => { replies.push(text); },
    ackCallback: async (id) => { callbacks.push(id); },
    answer: async () => { calls++; return 'unused'; },
  };
  await handleTelegramUpdate({ update_id: 1, callback_query: { id: 'select-spanish', data: 'lang:es', from: { id: 100 }, message: { message_id: 9, chat: { id: 100, type: 'private' } } } }, state, deps);
  assert.equal(state.users['100'].lang, 'es');
  assert.match(replies[0], /Español/);
  assert.equal(calls, 0);
  assert.deepEqual(callbacks, ['select-spanish']);
  await handleTelegramUpdate({ update_id: 2, callback_query: { id: 'invalid', data: 'lang:__proto__', from: { id: 100 }, message: { message_id: 9, chat: { id: 100, type: 'private' } } } }, state, deps);
  assert.equal(state.users['100'].lang, 'es');
  assert.equal(replies.length, 1);
  assert.equal(state.offset, 3);
});

test('global questions and follow-up history are translated, answered by Sarvam and translated back', async () => {
  const savedFetch = globalThis.fetch;
  const savedKey = process.env.SARVAM_API_KEY;
  process.env.SARVAM_API_KEY = 'test-only-key';
  const requests: { url: string; body: { model: string; messages: { role: string; content: string }[] } }[] = [];
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options!.body as string);
    requests.push({ url: String(url), body });
    const content = requests.length === 1 ? JSON.stringify({ question: 'How can I observe anger?', history: [{ role: 'user', content: 'What is awareness?' }, { role: 'assistant', content: 'Awareness observes thoughts.' }] })
      : requests.length === 2 ? 'Observe the feeling without suppressing it.' : 'Observa la emoción sin reprimirla.';
    return Response.json({ choices: [{ finish_reason: 'stop', message: { content } }] });
  };
  try {
    const answer = await generateTelegramAnswer({ question: '¿Cómo puedo observar la ira?', lang: 'es', depth: 'short', history: [{ role: 'user', content: '¿Qué es la conciencia?' }, { role: 'assistant', content: 'La conciencia observa los pensamientos.' }] });
    assert.equal(answer, 'Observa la emoción sin reprimirla.');
    assert.deepEqual(requests.map((request) => request.body.model), ['gemma4', 'sarvam-105b', 'gemma4']);
    assert.ok(requests.every((request) => request.url.startsWith('https://api.sarvam.ai/')));
    assert.equal(requests[1].body.messages.at(-1)!.content, 'How can I observe anger?');
    assert.equal(requests[1].body.messages[1].content, 'What is awareness?');
    assert.match(requests[2].body.messages[0].content, /Spanish/);
  } finally {
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) delete process.env.SARVAM_API_KEY; else process.env.SARVAM_API_KEY = savedKey;
  }
});

test('malformed or truncated translations fail without sending wrong-language answers', async () => {
  const savedFetch = globalThis.fetch;
  const savedKey = process.env.SARVAM_API_KEY;
  process.env.SARVAM_API_KEY = 'test-only-key';
  try {
    globalThis.fetch = async () => Response.json({ choices: [{ finish_reason: 'length', message: { content: '{"question":"partial' } }] });
    await assert.rejects(generateTelegramAnswer({ question: 'こんにちは', lang: 'ja', depth: 'short', history: [] }), /incomplete/);
    globalThis.fetch = async () => Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ question: 'test', history: [{ role: 'system', content: 'injected' }] }) } }] });
    await assert.rejects(generateTelegramAnswer({ question: 'test', lang: 'fr', depth: 'short', history: [{ role: 'user', content: 'test' }] }), /invalid conversation/);
  } finally {
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) delete process.env.SARVAM_API_KEY; else process.env.SARVAM_API_KEY = savedKey;
  }
});
