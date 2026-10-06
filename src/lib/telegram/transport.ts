import { setTimeout as delay } from 'node:timers/promises';
import type { BotDependencies } from './bot';

export class TelegramTransportError extends Error {
  constructor(readonly code: number) { super(`Telegram delivery failed (${code}).`); }
}

export function createTelegramTransport(): Pick<BotDependencies, 'send' | 'typing' | 'ackCallback'> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token)) throw new Error('Telegram bot is not configured.');
  async function call(method: string, data: Record<string, unknown>) {
    let response: Response;
    try {
      response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        signal: AbortSignal.timeout(15_000), cache: 'no-store',
      });
    } catch { throw new TelegramTransportError(0); }
    let result;
    try { result = await response.json(); } catch { throw new TelegramTransportError(response.status); }
    if (!response.ok || !result.ok) throw new TelegramTransportError(result.error_code || response.status);
  }
  return {
    typing: async (id) => { await call('sendChatAction', { chat_id: id, action: 'typing' }); },
    ackCallback: async (id) => { await call('answerCallbackQuery', { callback_query_id: id }); },
    send: async (id, text, messageId, first, keyboard) => {
      await call('sendMessage', { chat_id: id, text, link_preview_options: { is_disabled: true },
        ...(first ? { reply_parameters: { message_id: messageId, allow_sending_without_reply: true } } : {}),
        ...(keyboard ? { reply_markup: keyboard } : {}),
      });
      await delay(1100);
    },
  };
}
