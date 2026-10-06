import { randomUUID, timingSafeEqual } from 'node:crypto';
import { finishPending, handleTelegramUpdate, type BotDependencies, type TelegramUpdate } from './bot';
import type { CloudBotStore } from './cloud-store';
import { TelegramTransportError } from './transport';

export function isWebhookAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!header || !secret || header.length > 256) return false;
  const actual = Buffer.from(header), expected = Buffer.from(secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Validate untrusted JSON before touching storage or generating paid answers. */
export function parseTelegramUpdate(value: unknown): TelegramUpdate | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as TelegramUpdate;
  if (!Number.isSafeInteger(data.update_id) || data.update_id < 0) return null;
  const message = data.message;
  if (message && (!Number.isSafeInteger(message.message_id) || !Number.isSafeInteger(message.date) || !message.chat || !Number.isSafeInteger(message.chat.id) || typeof message.chat.type !== 'string' || (message.text !== undefined && typeof message.text !== 'string') || (message.from && !Number.isSafeInteger(message.from.id)))) return null;
  const callback = data.callback_query;
  if (callback && (typeof callback.id !== 'string' || callback.id.length > 256 || !callback.from || !Number.isSafeInteger(callback.from.id) || (callback.data !== undefined && (typeof callback.data !== 'string' || callback.data.length > 64)) || (callback.message && (!Number.isSafeInteger(callback.message.message_id) || !callback.message.chat || !Number.isSafeInteger(callback.message.chat.id) || typeof callback.message.chat.type !== 'string')))) return null;
  return data;
}

export async function readWebhookBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Empty request');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > 65_536) { await reader.cancel(); throw new Error('Request too large'); }
      chunks.push(part.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { reader.releaseLock(); }
}

export async function runCloudUpdate(update: TelegramUpdate, store: CloudBotStore, dependencies: Omit<BotDependencies, 'save'>): Promise<'done' | 'busy'> {
  const message = update.message ?? (update.callback_query?.message ? { ...update.callback_query.message, from: update.callback_query.from } : undefined);
  // Private questions only; unsupported updates are safely acknowledged.
  if (!message || message.chat.type !== 'private' || !message.from || message.from.is_bot || message.from.id !== message.chat.id) return 'done';
  const owner = randomUUID();
  const envelope = await store.claim(owner);
  if (!envelope) return 'busy';
  let pendingId = envelope.state.pending?.updateId;
  const deps: BotDependencies = {
    ...dependencies,
    save: async () => {
      if (envelope.state.pending) pendingId = envelope.state.pending.updateId;
      else if (pendingId !== undefined) {
        if (!envelope.completed.includes(pendingId)) envelope.completed.push(pendingId);
        envelope.completed = envelope.completed.slice(-5000);
        pendingId = undefined;
      }
      await store.save(owner, envelope);
    },
  };
  try {
    // Telegram retries until we return 200. Resume saved chunks after a failure;
    // no early acknowledgment or ephemeral filesystem storage is used.
    await finishPending(envelope.state, deps);
    if (!envelope.completed.includes(update.update_id)) {
      // Webhooks can arrive out of order: use completed IDs instead of polling's offset.
      envelope.state.offset = 0;
      await handleTelegramUpdate(update, envelope.state, deps);
      if (!envelope.completed.includes(update.update_id)) envelope.completed.push(update.update_id);
      envelope.completed = envelope.completed.slice(-5000);
      await store.save(owner, envelope);
    }
    return 'done';
  } catch (error) {
    if (error instanceof TelegramTransportError && [400, 403].includes(error.code) && envelope.state.pending) {
      const discardedId = envelope.state.pending.updateId;
      delete envelope.state.pending;
      await deps.save();
      return discardedId === update.update_id ? 'done' : 'busy';
    }
    throw error;
  } finally {
    // An expired owner cannot release a newer invocation's lease.
    await store.release(owner).catch(() => undefined);
  }
}
