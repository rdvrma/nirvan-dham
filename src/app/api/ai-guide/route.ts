import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/guarddog/rateLimit';
import { generateGuideAnswer, GuideError, type GuideMessage } from '@/lib/ai-guide/answer';

export const runtime = 'nodejs';

function parseHistory(value: unknown): GuideMessage[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-8).flatMap((item): GuideMessage[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    if (typeof record.text !== 'string' || !record.text.trim()) return [];
    if (record.role !== 'user' && record.role !== 'bot') return [];
    return [{ role: record.role === 'bot' ? 'assistant' : 'user', content: record.text.slice(0, 1200) }];
  });
}

export async function POST(req: NextRequest) {
  const declaredLength = Number(req.headers.get('content-length') ?? 0);
  if (declaredLength > 16_384) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 16_384) throw new Error('too large');
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid');
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // The question alias preserves the existing WebMCP caller.
  const message = typeof body.message === 'string' ? body.message.trim()
    : typeof body.question === 'string' ? body.question.trim() : '';
  if (!message || message.length > 2000) {
    return NextResponse.json({ error: 'Please send a question of at most 2000 characters.' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  if (!checkRateLimit(`ai-guide:${ip}`, RATE_LIMITS.aiGuide).allowed) {
    return NextResponse.json({ error: 'Please wait before sending another question.' }, { status: 429 });
  }

  try {
    const response = await generateGuideAnswer({ question: message, lang: body.lang === 'hi' ? 'hi' : 'en', history: parseHistory(body.history) });
    return NextResponse.json({ response, answer: response });
  } catch (error) {
    const known = error instanceof GuideError;
    return NextResponse.json({ error: known ? error.message : 'AI guide is temporarily unavailable.' }, { status: known ? error.status : 503 });
  }
}
