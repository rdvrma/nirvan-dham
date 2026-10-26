import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

type Application = Record<string, unknown>;
const attempts = new Map<string, number[]>();
const limitWindowMs = 60 * 60 * 1000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(data: Application, key: string, max: number): string {
  const value = data[key];
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
function safeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < limitWindowMs);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 5;
}

async function notifyAdmin(application: Record<string, string>) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD ?? process.env.SMTP_PASS;
  const recipient = process.env.ADMIN_EMAIL ?? user;
  if (!user || !pass || !recipient) return;
  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    const rows = Object.entries(application).map(([key, value]) =>
      `<tr><th style="text-align:left;vertical-align:top;padding:9px;border-bottom:1px solid #ddd">${safeHtml(key)}</th><td style="padding:9px;border-bottom:1px solid #ddd;white-space:pre-wrap">${safeHtml(value)}</td></tr>`,
    ).join('');
    await transporter.sendMail({
      from: `"Nirvan Dham Samvad" <${user}>`,
      to: recipient,
      replyTo: application.email,
      subject: `[Bodhgaya Samvad] New request ${application.reference}`,
      html: `<h2>Bodhgaya Samvad request</h2><table style="border-collapse:collapse">${rows}</table><p>Review in the Supabase dashboard. Submission does not reserve a time.</p>`,
    });
  } catch (error) {
    console.error('[bodhgaya-samvad/apply] Notification failed', error);
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  if (Number(request.headers.get('content-length') ?? 0) > 12000) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ error: 'Please try later' }, { status: 429 });

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
  const travelDates = field(data, 'travelDates', 160);
  const meetingType = field(data, 'meetingType', 20);
  const primaryQuestion = field(data, 'primaryQuestion', 2000);
  const whyInPerson = field(data, 'whyInPerson', 2000);
  const note = field(data, 'note', 2000);
  const acceptedMeetingTypes = ['individual', 'couple', 'small_group'];
  if (!uuid.test(id) || name.length < 2 || !emailPattern.test(email) || phone.length < 6 || !country || !travelDates
    || !['English', 'Hindi'].includes(preferredLanguage) || !['en', 'hi'].includes(pageLanguage)
    || !acceptedMeetingTypes.includes(meetingType) || primaryQuestion.length < 30 || whyInPerson.length < 20
    || data.requestConsent !== 'on' || data.contributionConsent !== 'on' || data.contactConsent !== 'on') {
    return NextResponse.json({ error: 'Please complete the required fields' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.json({ error: 'Application storage is unavailable' }, { status: 503 });
  const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await supabase.from('bodhgaya_samvad_requests').insert({
    id, name, email, phone, country, preferred_language: preferredLanguage,
    page_language: pageLanguage, travel_dates: travelDates, meeting_type: meetingType,
    primary_question: primaryQuestion, why_in_person: whyInPerson, note: note || null,
    contact_consent: true, request_consent: true, contribution_consent: true,
  });
  if (error && error.code !== '23505') {
    console.error('[bodhgaya-samvad/apply] Persistence failed', error.code);
    return NextResponse.json({ error: 'Application could not be saved' }, { status: 503 });
  }
  const reference = `BS-${id.slice(0, 8).toUpperCase()}`;
  if (!error) await notifyAdmin({ reference, name, email, phone, country, preferredLanguage, travelDates, meetingType, primaryQuestion, whyInPerson, note });
  return NextResponse.json({ reference }, { headers: { 'Cache-Control': 'no-store' } });
}
