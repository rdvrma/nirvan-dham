import { NextResponse, type NextRequest } from 'next/server';

/**
 * Guard Dog Status Endpoint
 * GET /api/guarddog/status?token=YOUR_SECRET
 * Returns basic health info. Protected by secret token.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const secret = process.env.GUARDDOG_SECRET;

  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'active',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      rateLimiting: true,
      botDetection: true,
      urlScanning: true,
      promptInjectionScan: true,
      securityHeaders: true,
    },
    rateLimits: {
      page: '120 req/min per IP',
      api: '20 req/min per IP',
      aiGuide: '10 req/min per IP',
      auth: '10 req/min per IP',
    },
    message: 'Guard Dog is watching. 🐕',
  });
}
