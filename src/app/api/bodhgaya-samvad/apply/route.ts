import { NextRequest, NextResponse } from 'next/server';
import { samvadStore, TABLE, PAYMENT_URL, requestReference } from '@/lib/bodhgaya-samvad/server';
import { slotStart, validBookingDate } from '@/lib/bodhgaya-samvad/slots';

export const runtime = 'nodejs';
type Application = Record<string, unknown>;
const attempts = new Map<string, number[]>();
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(data: Application, key: string, max: number): string {
  return typeof data[key] === 'string' ? (data[key] as string).trim().slice(0, max) : '';
}
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 3600000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 5;
}
async function emailRequest(row: Record<string, string>): Promise<boolean> {
  const url = process.env.SAMVAD_FORMSPREE_URL || 'https://formspree.io/f/xqeogwza';
  if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(url)) return false;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `Bodhgaya Samvad booking · ${row.reference} · ${row.name}`, ...row }),
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) return true;
      console.error('[bodhgaya-samvad/apply] Formspree status', response.status);
    } catch (error) {
      console.error('[bodhgaya-samvad/apply] Formspree unreachable', (error as Error).message);
    }
  }
  return false;
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  if (Number(request.headers.get('content-length') ?? 0) > 12000) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const data = await request.json().catch(() => null) as Application | null;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  if (field(data, 'website', 200)) return NextResponse.json({ reference: 'REQUEST RECEIVED' });
  const id = field(data, 'submissionId', 36);
  const name = field(data, 'name', 120);
  const email = field(data, 'email', 180).toLowerCase();
  const phone = field(data, 'phone', 40);
  const country = field(data, 'country', 100);
  const preferredLanguage = field(data, 'preferredLanguage', 20);
  const pageLanguage = field(data, 'pageLanguage', 2);
  const bookingDate = field(data, 'bookingDate', 10);
  const bookingTime = field(data, 'bookingTime', 5);
  const meetingType = field(data, 'meetingType', 20);
  const startsAt = slotStart(bookingDate, bookingTime);
  if (!uuid.test(id) || name.length < 2 || !emailPattern.test(email) || phone.length < 6 || !country
    || !['English', 'Hindi'].includes(preferredLanguage) || !['en', 'hi'].includes(pageLanguage)
    || !validBookingDate(bookingDate) || !startsAt || Date.parse(startsAt) <= Date.now() + 15 * 60000
    || !['individual', 'couple', 'small_group'].includes(meetingType)) {
    return NextResponse.json({ error: 'Please complete the required fields' }, { status: 400 });
  }
  let store;
  try { store = samvadStore(); }
  catch { return NextResponse.json({ error: 'Booking storage is unavailable' }, { status: 503 }); }
  const reference = requestReference(id);
  const { data: previous } = await store.from(TABLE).select('email,agreed_slot,booking_token,formspree_notified_at').eq('id', id).maybeSingle();
  if (previous) {
    if (previous.email !== email || previous.agreed_slot !== startsAt) return NextResponse.json({ error: 'Invalid retry' }, { status: 409 });
    if (!previous.formspree_notified_at) {
      const notified = await emailRequest({ reference, name, email, phone, country, preferredLanguage,
        bookingDate, bookingTime, meetingType,
        privateRequest: `https://www.nirvandham.in/bodhgaya-samvad/request/${previous.booking_token}` });
      if (!notified) return NextResponse.json({ error: 'Your slot is booked, but the notification email could not be sent. Please retry with the same details.', reference }, { status: 503 });
      await store.from(TABLE).update({ formspree_notified_at: new Date().toISOString() }).eq('id', id);
    }
    return NextResponse.json({ reference, paymentUrl: PAYMENT_URL, requestUrl: `/bodhgaya-samvad/request/${previous.booking_token}` }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (rateLimited(ip)) return NextResponse.json({ error: 'Please try later' }, { status: 429 });
  const { data: inserted, error: insertError } = await store.from(TABLE).insert({
    id, name, email, phone, country, preferred_language: preferredLanguage,
    page_language: pageLanguage, travel_dates: bookingDate, meeting_type: meetingType,
    primary_question: null, why_in_person: null, note: null,
    contact_consent: true, request_consent: true, contribution_consent: true, agreed_slot: startsAt,
  }).select('booking_token').single();
  if (insertError || !inserted) {
    return NextResponse.json({ error: insertError?.code === '23505' ? 'That slot was just booked. Please choose another.' : 'Booking could not be saved' }, { status: insertError?.code === '23505' ? 409 : 503 });
  }
  const notified = await emailRequest({ reference, name, email, phone, country, preferredLanguage,
    bookingDate, bookingTime, meetingType,
    privateRequest: `https://www.nirvandham.in/bodhgaya-samvad/request/${inserted.booking_token}` });
  if (!notified) {
    console.error('[bodhgaya-samvad/apply] Owner notification pending for', reference);
    return NextResponse.json({ error: 'Your slot is booked, but the notification email could not be sent. Please retry with the same details.', reference }, { status: 503 });
  }
  await store.from(TABLE).update({ formspree_notified_at: new Date().toISOString() }).eq('id', id);
  return NextResponse.json({ reference, paymentUrl: PAYMENT_URL, requestUrl: `/bodhgaya-samvad/request/${inserted.booking_token}` }, { headers: { 'Cache-Control': 'no-store' } });
}
