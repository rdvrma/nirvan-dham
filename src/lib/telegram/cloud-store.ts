import type { BotState } from './bot';

export interface CloudBotState { state: BotState; completed: number[] }
export interface CloudBotStore {
  claim(owner: string): Promise<CloudBotState | null>;
  save(owner: string, value: CloudBotState): Promise<void>;
  release(owner: string): Promise<void>;
}

/** Credentials never reach the browser, output, or Telegram replies. */
export function createCloudBotStore(): CloudBotStore {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Cloud bot storage is not configured.');
  const origin = new URL(url);
  if (origin.protocol !== 'https:') throw new Error('Cloud bot storage must use HTTPS.');
  async function rpc(name: string, input: Record<string, unknown>) {
    let response: Response;
    try {
      response = await fetch(new URL(`/rest/v1/rpc/${name}`, origin), {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: key!, Authorization: `Bearer ${key}` },
        body: JSON.stringify(input), signal: AbortSignal.timeout(15_000), cache: 'no-store',
      });
    } catch { throw new Error('Cloud bot storage request failed.'); }
    if (!response.ok) throw new Error(`Cloud bot storage request failed (${response.status}).`);
    try { return response.status === 204 ? null : await response.json(); }
    catch { throw new Error('Cloud bot storage returned an invalid response.'); }
  }
  return {
    claim: async (owner) => {
      const value = await rpc('telegram_bot_claim', { p_owner: owner });
      if (value === null) return null;
      if (value?.state?.version !== 1 || !value.state.users || !value.state.usage || !value.state.globalUsage || !Array.isArray(value.completed) || !value.completed.every(Number.isSafeInteger)) throw new Error('Cloud bot state is invalid.');
      return value as CloudBotState;
    },
    save: async (owner, value) => {
      if (await rpc('telegram_bot_save', { p_owner: owner, p_payload: value }) !== true) throw new Error('Cloud bot storage lease expired.');
    },
    release: async (owner) => { await rpc('telegram_bot_release', { p_owner: owner }); },
  };
}
