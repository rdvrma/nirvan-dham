import { createCloudBotStore } from '@/lib/telegram/cloud-store';
import { createTelegramTransport } from '@/lib/telegram/transport';
import { generateTelegramAnswer } from '@/lib/telegram/answer';
import { isWebhookAuthorized, parseTelegramUpdate, readWebhookBody, runCloudUpdate } from '@/lib/telegram/webhook';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET() {
  // Public status never exposes credentials, chat IDs, conversations or quotas.
  return Response.json({ service: 'Nirvan Dham Telegram guide', mode: 'webhook' });
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || !process.env.SARVAM_API_KEY || !process.env.TELEGRAM_BOT_TOKEN || !process.env.SUPABASE_SERVICE_ROLE_KEY) return new Response('Not configured', { status: 503 });
  if (!isWebhookAuthorized(request.headers.get('x-telegram-bot-api-secret-token'), secret)) return new Response('Unauthorized', { status: 401 });
  let update;
  try { update = parseTelegramUpdate(await readWebhookBody(request)); }
  catch { return new Response('Invalid update', { status: 400 }); }
  if (!update) return new Response('Invalid update', { status: 400 });
  try {
    const dailyLimit = Number(process.env.TELEGRAM_DAILY_LIMIT || 30);
    const globalDailyLimit = Number(process.env.TELEGRAM_GLOBAL_DAILY_LIMIT || 300);
    if (![dailyLimit, globalDailyLimit].every((n) => Number.isSafeInteger(n) && n > 0)) throw new Error('Invalid limit');
    const result = await runCloudUpdate(update, createCloudBotStore(), {
      ...createTelegramTransport(), answer: generateTelegramAnswer, now: Date.now, dailyLimit, globalDailyLimit,
    });
    return result === 'done' ? Response.json({ ok: true }) : new Response('Busy; retry', { status: 503, headers: { 'Retry-After': '5' } });
  } catch {
    console.error('Telegram webhook delivery or storage failed; update will be retried.');
    return new Response('Temporary failure; retry', { status: 503 });
  }
}
