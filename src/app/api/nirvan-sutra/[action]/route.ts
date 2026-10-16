import { NextRequest, NextResponse } from 'next/server';
import { ensureLearnerId, NotSignedIn, currentAccount } from '@/course/nirvan-sutra/server/session';
import { handleAction, ActionError, type Notify } from '@/course/nirvan-sutra/server/actions';
import { sendWritten } from '@/course/nirvan-sutra/server/notify';

// Nirvan Sutra (v2) learner actions (file store locally, ns_progress with accounts); scores are computed here, never accepted from the client.
export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'JSON body expected' }, { status: 400 });
  try {
    const learnerId = await ensureLearnerId();
    // own-words answers go on to the owner's inbox, with the account's email as the reply-to
    const notify: Notify = async (n) => sendWritten({ ...n, learner: { ...n.learner, email: (await currentAccount().catch(() => null))?.email ?? null } });
    const result = await handleAction(learnerId, action, body, { dev: process.env.NODE_ENV !== 'production', notify });
    const response = NextResponse.json(result);
    if ((action === 'enroll' || action === 'locale') && 'locale' in result && typeof result.locale === 'string') {
      response.cookies.set('ns_lang', result.locale, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, secure: process.env.NODE_ENV === 'production' });
    }
    return response;
  } catch (e) {
    if (e instanceof NotSignedIn) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ActionError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error('nirvan-sutra action failed', action, e);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
