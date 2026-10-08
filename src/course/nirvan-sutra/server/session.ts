// SERVER ONLY: the learner of this browser. Locally an httpOnly cookie with a random id (no account needed to try the course); the seam where the
// Supabase user id replaces it once the course is wired to accounts.
import { cookies } from 'next/headers';
import { newLearnerId, loadOrCreate } from './store';
import type { Progress } from '../types';

export const LEARNER_COOKIE = 'ns_learner';

/** The learner id from the cookie, or null (server components may not set cookies; the first API call does). */
export async function learnerIdOrNull(): Promise<string | null> {
  const v = (await cookies()).get(LEARNER_COOKIE)?.value ?? null;
  return v && /^[a-zA-Z0-9-]{8,64}$/.test(v) ? v : null;
}

/** In a route handler: the learner id, created and set on first use. */
export async function ensureLearnerId(): Promise<string> {
  const jar = await cookies();
  const have = await learnerIdOrNull();
  if (have) return have;
  const id = newLearnerId();
  jar.set(LEARNER_COOKIE, id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 * 2, secure: process.env.NODE_ENV === 'production' });
  return id;
}

export async function currentProgress(): Promise<Progress | null> {
  const id = await learnerIdOrNull();
  return id ? loadOrCreate(id) : null;
}
