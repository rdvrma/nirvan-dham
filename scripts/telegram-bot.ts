import { loadEnvConfig } from '@next/env';
import { access, mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { generateTelegramAnswer } from '../src/lib/telegram/answer';
import { emptyBotState, finishPending, handleTelegramUpdate, type BotState, type TelegramUpdate, type BotDependencies } from '../src/lib/telegram/bot';

loadEnvConfig(process.cwd());

class TelegramError extends Error {
  constructor(public readonly code: number, public readonly retryAfter = 0) {
    super(`Telegram request failed (${code})`);
  }
}

function positiveLimit(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  return value;
}

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token)) throw new Error('Set TELEGRAM_BOT_TOKEN in .env.local before starting the bot.');
  if (!process.env.SARVAM_API_KEY?.trim()) throw new Error('Set SARVAM_API_KEY in .env.local before starting the bot.');
  const folder = process.env.LOCALAPPDATA || join(homedir(), '.local', 'share');
  const file = resolve(process.env.TELEGRAM_STATE_FILE || join(folder, 'NirvanDham', 'telegram-bot', 'state.json'));
  await mkdir(dirname(file), { recursive: true, mode: 0o700 });

  // Never print raw fetch errors: Telegram URLs contain the token.
  async function telegram<T>(method: string, body: Record<string, unknown>, seconds = 20): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        signal: AbortSignal.timeout(seconds * 1000),
      });
    } catch {
      throw new TelegramError(0);
    }
    let data;
    try { data = await response.json(); } catch { throw new TelegramError(response.status); }
    if (!response.ok || !data.ok) throw new TelegramError(data.error_code || response.status, data.parameters?.retry_after || 0);
    return data.result as T;
  }

  const identity = await telegram<{ username: string; id: number }>('getMe', {});
  const webhook = await telegram<{ url: string }>('getWebhookInfo', {});
  if (webhook.url) throw new Error('This bot has an active webhook. Remove it intentionally before using polling; it was not changed.');
  const lockPath = `${file}.lock`;
  try {
    const lock = await open(lockPath, 'wx', 0o600);
    await lock.writeFile(String(process.pid));
    await lock.close();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    const pid = Number(await readFile(lockPath, 'utf8'));
    let alive = false;
    try { process.kill(pid, 0); alive = true; } catch { /* old process ended */ }
    if (alive) throw new Error('The bot is already running. Do not start a second instance.');
    await rm(lockPath);
    const lock = await open(lockPath, 'wx', 0o600);
    await lock.writeFile(String(process.pid));
    await lock.close();
  }

  let stopping = false;
  process.on('SIGINT', () => { stopping = true; });
  process.on('SIGTERM', () => { stopping = true; });
  try {
    let state: BotState;
    try {
      state = JSON.parse(await readFile(file, 'utf8'));
      if (state.version !== 1 || !Number.isSafeInteger(state.offset) || !state.users || !state.usage || !state.globalUsage) throw new Error('Invalid bot state. Restore a valid copy; it was not overwritten.');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      state = emptyBotState();
    }
    const deps: BotDependencies = {
      now: Date.now,
      dailyLimit: positiveLimit('TELEGRAM_DAILY_LIMIT', 30),
      globalDailyLimit: positiveLimit('TELEGRAM_GLOBAL_DAILY_LIMIT', 300),
      answer: generateTelegramAnswer,
      save: async () => {
        await writeFile(`${file}.tmp`, JSON.stringify(state), { mode: 0o600 });
        await rename(`${file}.tmp`, file);
      },
      typing: async (chatId) => { await telegram('sendChatAction', { chat_id: chatId, action: 'typing' }); },
      ackCallback: async (id) => { await telegram('answerCallbackQuery', { callback_query_id: id }); },
      send: async (chatId, text, messageId, first, keyboard) => {
        await telegram('sendMessage', {
          chat_id: chatId, text,
          link_preview_options: { is_disabled: true },
          ...(first ? { reply_parameters: { message_id: messageId, allow_sending_without_reply: true } } : {}),
          ...(keyboard ? { reply_markup: keyboard } : {}),
        });
        // Sequential chunk delivery stays below Telegram's per-chat send rate.
        await delay(1100);
      },
    };
    await telegram('setMyCommands', { commands: [
      { command: 'start', description: 'Start the free Nirvan Dham AI guide' },
      { command: 'hindi', description: 'हिंदी में उत्तर' },
      { command: 'english', description: 'Answers in English' },
      { command: 'language', description: 'Choose from 33 languages / भाषा चुनें' },
      { command: 'short', description: 'Shorter answers / छोटे उत्तर' },
      { command: 'detailed', description: 'Detailed answers / विस्तृत उत्तर' },
      { command: 'new', description: 'Start a fresh conversation' },
      { command: 'forget', description: 'Remove saved conversation memory' },
      { command: 'course', description: 'Open the Nirvana Sutra course' },
      { command: 'privacy', description: 'How conversation data is used' },
      { command: 'help', description: 'Commands and help' },
    ] });
    await telegram('setMyDescription', { description: 'Free Nirvan Dham AI companion for self-inquiry, witness awareness and meditation. Choose from 33 languages with /language. Detailed answers by default; /short for brief replies. Inspired by published teachings. Press Start to begin. सभी साधकों के लिए निःशुल्क AI साथी।' });
    await telegram('setMyShortDescription', { short_description: 'Free Nirvan Dham AI guide • 33 languages • Detailed or short answers • Self-inquiry and meditation' });
    console.log(`Nirvan Dham bot is running: https://t.me/${identity.username}`);
    console.log(`Free access; daily limits: ${deps.dailyLimit}/seeker, ${deps.globalDailyLimit} total. Keep this process running for replies.`);
    while (!stopping) {
      try {
        try {
          await access(`${file}.stop`);
          stopping = true;
          continue;
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
        await finishPending(state, deps);
        const updates = await telegram<TelegramUpdate[]>('getUpdates', { offset: state.offset, timeout: 25, limit: 1, allowed_updates: ['message', 'callback_query'] }, 35);
        for (const update of updates) await handleTelegramUpdate(update, state, deps);
      } catch (error) {
        if (error instanceof TelegramError && (error.code === 401 || error.code === 409)) throw error;
        if (error instanceof TelegramError && (error.code === 403 || error.code === 400) && state.pending) {
          // A blocked bot or permanently invalid destination must not block other seekers.
          state.offset = Math.max(state.offset, state.pending.updateId + 1);
          delete state.pending;
          await deps.save();
          console.warn('Skipped an undeliverable reply.');
          continue;
        }
        // Disk persistence failures must stop polling, rather than lose saved updates.
        if (!(error instanceof TelegramError)) throw error;
        console.warn(`Temporary Telegram error (${error.code}); retrying.`);
        await delay(Math.max(5000, Math.min(error.retryAfter * 1000, 60_000)));
      }
    }
  } finally {
    await rm(lockPath, { force: true });
    await rm(`${file}.stop`, { force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof TelegramError ? `Telegram error (${error.code}). Check the bot token or another active bot process.` : error instanceof Error ? error.message : 'Bot stopped.');
  process.exitCode = 1;
});
