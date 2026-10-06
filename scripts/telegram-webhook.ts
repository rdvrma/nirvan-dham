import { loadEnvConfig } from '@next/env';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createCloudBotStore } from '../src/lib/telegram/cloud-store';
import { randomUUID } from 'node:crypto';
loadEnvConfig(process.cwd());

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is missing.');
  async function telegram(method: string, data: Record<string, unknown>) {
    let response: Response;
    try { response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(20_000) }); }
    catch { throw new Error('Telegram configuration request failed.'); }
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) throw new Error(`Telegram configuration failed (${response.status}).`);
    return result.result;
  }
  if (process.argv[2] === 'status') {
    const value = await telegram('getWebhookInfo', {});
    console.log(JSON.stringify({ webhook: value.url, pendingUpdates: value.pending_update_count, lastErrorAt: value.last_error_date || null }));
    return;
  }
  if (process.argv[2] !== 'enable') throw new Error('Usage: tsx scripts/telegram-webhook.ts enable|status');
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || !/^[A-Za-z0-9_-]{32,256}$/.test(secret)) throw new Error('Set a random TELEGRAM_WEBHOOK_SECRET of at least 32 characters.');
  const file = resolve(process.env.TELEGRAM_STATE_FILE || join(process.env.LOCALAPPDATA || join(homedir(), '.local', 'share'), 'NirvanDham', 'telegram-bot', 'state.json'));
  try {
    const pid = Number(await readFile(`${file}.lock`, 'utf8'));
    let alive = false;
    try { process.kill(pid, 0); alive = true; } catch { /* stale lock */ }
    if (alive) throw new Error('Stop the local polling bot before enabling the webhook.');
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const store = createCloudBotStore();
  const owner = randomUUID();
  const cloud = await store.claim(owner);
  if (!cloud) throw new Error('Cloud bot is busy; retry shortly.');
  try {
    if (!Object.keys(cloud.state.users).length && !cloud.completed.length) {
      try {
        const local = JSON.parse(await readFile(file, 'utf8'));
        if (local.version !== 1 || local.pending || !local.users || !local.usage || !local.globalUsage) throw new Error('Finish pending local replies before migrating.');
        cloud.state = { ...local, offset: 0 };
        await store.save(owner, cloud);
        console.log('Local preferences and quotas copied to private cloud storage.');
      } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    }
  } finally { await store.release(owner); }
  const endpoint = 'https://www.nirvandham.in/api/telegram/webhook';
  let check: Response;
  try { check = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': secret }, body: JSON.stringify({ update_id: 0 }), signal: AbortSignal.timeout(25_000) }); }
  catch { throw new Error('Cloud endpoint check failed; webhook was not changed.'); }
  if (!check.ok) throw new Error(`Cloud endpoint is not ready (${check.status}); webhook was not changed.`);
  await telegram('setWebhook', { url: endpoint, secret_token: secret, max_connections: 1, allowed_updates: ['message', 'callback_query'], drop_pending_updates: false });
  console.log('Cloud webhook enabled. Pending Telegram messages were retained. PC is no longer required.');
}
main().catch((error) => { console.error(error instanceof Error ? error.message : 'Webhook setup failed.'); process.exitCode = 1; });
