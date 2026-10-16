// SERVER ONLY: who the learner is.
// NIRVAN_SUTRA_STORE=supabase -> the signed-in Supabase user (the site's own /login); no account, no course.
// Otherwise (local) -> an httpOnly cookie with a random id, so the course can be tried without an account.
import { cookies } from 'next/headers';
import { cache } from 'react';
import { newLearnerId, loadOrCreate, storeMode } from './store';
import type { Progress } from '../types';

export const LEARNER_COOKIE = 'ns_learner';
export class NotSignedIn extends Error { constructor() { super('sign in required'); } }

export interface Account { id: string; email: string | null; name: string | null }

/** The signed-in Supabase account (supabase mode only). */
export const currentAccount = cache(async (): Promise<Account | null> => {
  if (storeMode() !== 'supabase') return null;
  const { supabaseClient } = await import('./supabase-store');
  const { data } = await (await supabaseClient()).auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const metadata = claims.user_metadata as Record<string, unknown> | undefined;
  const name = typeof metadata?.name === 'string' && metadata.name.trim() ? metadata.name.trim() : null;
  return { id: claims.sub, email: typeof claims.email === 'string' ? claims.email : null, name };
});

/** The learner id, or null (server components may not set cookies; the first API call does). */
export async function learnerIdOrNull(): Promise<string | null> {
  if (storeMode() === 'supabase') return (await currentAccount())?.id ?? null;
  const v = (await cookies()).get(LEARNER_COOKIE)?.value ?? null;
  return v && /^[a-zA-Z0-9-]{8,64}$/.test(v) ? v : null;
}

/** In a route handler: the learner id (local: created and set on first use; supabase: the account, else NotSignedIn). */
export async function ensureLearnerId(): Promise<string> {
  const have = await learnerIdOrNull();
  if (have) return have;
  if (storeMode() === 'supabase') throw new NotSignedIn();
  const id = newLearnerId();
  (await cookies()).set(LEARNER_COOKIE, id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 * 2, secure: process.env.NODE_ENV === 'production' });
  return id;
}

export const currentProgress = cache(async (): Promise<Progress | null> => {
  const id = await learnerIdOrNull();
  return id ? loadOrCreate(id) : null;
});
