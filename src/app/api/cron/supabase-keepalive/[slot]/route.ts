import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[supabase-keepalive] Supabase configuration is missing.');
    return Response.json({ ok: false }, { status: 503 });
  }

  // An anonymous, read-only query reaches Postgres without exposing learner data.
  // RLS may return zero rows; a successful query still confirms database access.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.from('user_progress').select('id', { head: true, count: 'exact' });

  if (error) {
    console.error('[supabase-keepalive] Database read failed:', error.message);
    return Response.json({ ok: false }, { status: 503 });
  }

  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
