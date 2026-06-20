import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function safeNext(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/course';
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNext(url.searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const loginUrl = new URL('/login', url.origin);
      loginUrl.searchParams.set('next', next);
      loginUrl.searchParams.set('error', 'Google sign-in could not be completed. Please try again.');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
