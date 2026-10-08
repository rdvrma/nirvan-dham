import { NextRequest, NextResponse } from 'next/server';
import { ensureLearnerId } from '@/course/nirvan-sutra/server/session';
import { handleAction, ActionError } from '@/course/nirvan-sutra/server/actions';

// Nirvan Sutra (v2) learner actions. Local store; scores are computed here, never accepted from the client.
export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'JSON body expected' }, { status: 400 });
  try {
    const learnerId = await ensureLearnerId();
    return NextResponse.json(await handleAction(learnerId, action, body, { dev: process.env.NODE_ENV !== 'production' }));
  } catch (e) {
    if (e instanceof ActionError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error('nirvan-sutra action failed', action, e);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
