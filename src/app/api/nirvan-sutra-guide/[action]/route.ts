import { NextRequest, NextResponse } from 'next/server';
import { currentAccount } from '@/course/nirvan-sutra/server/session';
import { handleGuideAction, GuideError } from '@/course/nirvan-sutra/server/guide-actions';

// Nirvan Sutra (v2) guide actions: the weekly session links and notes to learners. Guides only (ns_guides with accounts; dev locally).
export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'JSON body expected' }, { status: 400 });
  try {
    const account = await currentAccount();
    return NextResponse.json(await handleGuideAction(account?.id ?? null, action, body));
  } catch (e) {
    if (e instanceof GuideError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error('nirvan-sutra guide action failed', action, e);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
