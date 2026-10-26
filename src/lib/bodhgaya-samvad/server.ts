import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@/utils/supabase/server';

export const TABLE = 'bodhgaya_samvad_requests';
export const PAYMENT_URL = 'https://pages.razorpay.com/samvad-reservation';

export function samvadStore() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Samvad storage is not configured');
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function isSamvadAdmin() {
  const allowed = (process.env.SAMVAD_ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '')
    .split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!allowed.length) return false;
  const session = await createSessionClient();
  const { data: { user }, error } = await session.auth.getUser();
  return !error && !!user?.email && allowed.includes(user.email.toLowerCase());
}

export function requestReference(id: string) {
  return `BS-${id.slice(0, 8).toUpperCase()}`;
}
