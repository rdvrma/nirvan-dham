// SERVER ONLY: who the learner is.
// NIRVAN_SUTRA_STORE=supabase -> the signed-in Supabase user (the site's own /login); no account, no course.
// Otherwise (local) -> an httpOnly cookie with a random id, so the course can be tried without an account.
import { cookies } from 'next/headers';
import { newLearnerId, loadOrCreate, storeMode } from './store';
import type { Progress } from '../types';

export const LEARNER_COOKIE = 'ns_learner';
export class NotSignedIn extends Error { constructor() { super('sign in required'); } }

export interface Account { id: string; email: string | null; name: string | null }

/** The signed-in Supabase account (supabase mode only). */
export async function currentAccount(): Promise<Account | null> {
  if (storeMode() !== 'supabase') return null;
  const { supabaseClient } = await import('./supabase-store');
  const { data: { user } } = await (await supabaseClient()).auth.getUser();
  return user ? { id: user.id, email: user.email ?? null, name: typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim() ? user.user_metadata.name.trim() : null } : null;
}

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

export async function currentProgress(): Promise<Progress | null> {
  const id = await learnerIdOrNull();
  return id ? loadOrCreate(id) : null;
}
