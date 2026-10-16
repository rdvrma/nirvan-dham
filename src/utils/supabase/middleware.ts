import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );

    // getClaims verifies the JWT and uses the JWKS cache for asymmetric keys.
    // getUser made a network round trip on every course click, even when the
    // session was unchanged. Keep refresh handling in the cookie adapter.
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    return { response, user: claims ? { id: claims.sub } : null };
  } catch (err) {
    console.error('Supabase middleware initialization failed:', err);
    return { response, user: null };
  }
}
