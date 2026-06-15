import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lang = searchParams.get('lang') || 'hi';
  const next = searchParams.get('next') || '/';

  const response = NextResponse.redirect(new URL(next, request.url));
  
  response.cookies.set('nirvan-dham-language', lang, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
