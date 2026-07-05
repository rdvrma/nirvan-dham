import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { checkRateLimit, RATE_LIMITS } from '@/lib/guarddog/rateLimit';
import { scanUserAgent, scanUrl, scanPrompt } from '@/lib/guarddog/scanner';
import { logSecurityEvent, buildEvent } from '@/lib/guarddog/logger';

// ─── Guard Dog ─────────────────────────────────────────────────────────────────

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'
  );
}

function guardDog(request: NextRequest): NextResponse | null {
  const ip = getIp(request);
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') ?? '';
  const method = request.method;

  const ctx = { ip, method, path: pathname, userAgent };

  // 1. Bad bot / scanner detection
  const botCheck = scanUserAgent(userAgent);
  if (botCheck.detected) {
    logSecurityEvent(buildEvent(ctx, { threatType: botCheck.threatType!, severity: botCheck.severity!, blocked: true, detail: botCheck.detail }));
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. URL scan (path traversal, injection in query)
  const fullUrl = request.nextUrl.pathname + request.nextUrl.search;
  const urlCheck = scanUrl(fullUrl);
  if (urlCheck.detected) {
    logSecurityEvent(buildEvent(ctx, { threatType: urlCheck.threatType!, severity: urlCheck.severity!, blocked: true, detail: urlCheck.detail }));
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 3. Rate limiting — choose config based on route
  let rateCfg = RATE_LIMITS.page;
  if (pathname.startsWith('/api/ai-guide') || pathname.startsWith('/api/guide')) {
    rateCfg = RATE_LIMITS.aiGuide;
  } else if (pathname.startsWith('/api/')) {
    rateCfg = RATE_LIMITS.api;
  } else if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/auth')) {
    rateCfg = RATE_LIMITS.auth;
  }

  const rateResult = checkRateLimit(`${ip}:${pathname.split('/')[1]}`, rateCfg);
  if (!rateResult.allowed) {
    logSecurityEvent(buildEvent(ctx, { threatType: 'rate_limit', severity: 'medium', blocked: true, detail: `Limit: ${rateCfg.limit}/min` }));
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
        'X-RateLimit-Limit': String(rateCfg.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(rateResult.resetAt),
      },
    });
  }

  return null; // All clear
}

// ─── Main Middleware ───────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Run Guard Dog on every request
  const blocked = guardDog(request);
  if (blocked) return blocked;

  // Supabase session refresh (existing auth logic — unchanged)
  const { response, user } = await updateSession(request);

  // Course route protection (existing logic — unchanged)
  if (pathname !== '/course' && pathname.startsWith('/course/') && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|mp4|pdf|woff2?|ttf|otf)$).*)',
  ],
};
