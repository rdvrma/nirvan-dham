import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

interface ApplicationPayload {
  name?: string;
  organization_name?: string;
  tradition?: string;
  primary_language?: string;
  tester_count?: string;
  disciple_language?: string;
  whatsapp?: string;
  email?: string;
  disciple_private_testing?: string;
  internal_beta_listing_permission?: string;
  donation_support_preference?: string;
  future_interest?: string[];
  tradition_safety_notes?: string;
  test_question_notes?: string;
  additional_notes?: string;
  consent?: boolean;
  website?: string;
}

const recentRequests = new Map<string, number[]>();

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const attempts = (recentRequests.get(ip) || []).filter((time) => time > hourAgo);
  attempts.push(now);
  recentRequests.set(ip, attempts);
  return attempts.length > 5;
}

async function notifyAdmin(app: Required<Omit<ApplicationPayload, 'website'>>) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_APP_PASSWORD ?? process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL ?? smtpUser;
  if (!smtpUser || !smtpPass || !adminEmail) return { status: 'not_configured', error: 'SMTP is not configured.' } as const;

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: smtpUser, pass: smtpPass } });
    
    await transporter.sendMail({
      from: `"Nirvan Dham Guru Beta" <${smtpUser}>`,
      to: adminEmail,
      replyTo: app.email,
      subject: `[Guru Beta] नया आवेदन - ${app.name}`,
      html: `<div style="font-family:Arial,sans-serif;color:#172219;max-width:920px;margin:auto;">
        <h2 style="color:#8a651c;">Guru Beta Seva Application</h2>
        <p><strong>नाम:</strong> ${escapeHtml(app.name)}</p>
        <p><strong>संस्था:</strong> ${escapeHtml(app.organization_name)}</p>
        <p><strong>परंपरा:</strong> ${escapeHtml(app.tradition)}</p>
        <p><strong>भाषा:</strong> ${escapeHtml(app.primary_language)}</p>
        <p><strong>साधक संख्या:</strong> ${escapeHtml(app.tester_count)}</p>
        <p><strong>साधकों की भाषा:</strong> ${escapeHtml(app.disciple_language)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(app.whatsapp)}</p>
        <p><strong>ईमेल:</strong> ${escapeHtml(app.email)}</p>
        <hr/>
        <p><strong>निजी परीक्षण:</strong> ${escapeHtml(app.disciple_private_testing)}</p>
        <p><strong>आंतरिक बीटा सूची में नाम:</strong> ${escapeHtml(app.internal_beta_listing_permission)}</p>
        <p><strong>दान विकल्प:</strong> ${escapeHtml(app.donation_support_preference)}</p>
        <p><strong>भविष्य में रुचि:</strong> ${escapeHtml(app.future_interest.join(', '))}</p>
        <hr/>
        <p><strong>परंपरा सावधानियां:</strong><br/>${escapeHtml(app.tradition_safety_notes)}</p>
        <p><strong>परीक्षण प्रश्न:</strong><br/>${escapeHtml(app.test_question_notes)}</p>
        <p><strong>अन्य सुझाव:</strong><br/>${escapeHtml(app.additional_notes)}</p>
      </div>`,
    });
    return { status: 'sent' } as const;
  } catch (error) {
    console.error('[guru-beta/apply] Email delivery failed', error);
    return { status: 'failed', error: 'Email delivery failed.' } as const;
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) return NextResponse.json({ error: 'कृपया कुछ समय बाद पुनः प्रयास करें।' }, { status: 429 });

  const body = await request.json().catch(() => null) as ApplicationPayload | null;
  if (!body) return NextResponse.json({ error: 'अमान्य आवेदन।' }, { status: 400 });
  if (body.website) return NextResponse.json({ success: true });

  const name = clean(body.name, 120);
  const organization_name = clean(body.organization_name, 200);
  const tradition = clean(body.tradition, 100);
  const primary_language = clean(body.primary_language, 50);
  const tester_count = clean(body.tester_count, 50);
  const disciple_language = clean(body.disciple_language, 50);
  const whatsapp = clean(body.whatsapp, 40);
  const email = clean(body.email, 180).toLowerCase();
  const disciple_private_testing = clean(body.disciple_private_testing, 100);
  const internal_beta_listing_permission = clean(body.internal_beta_listing_permission, 100);
  const donation_support_preference = clean(body.donation_support_preference, 150);
  const future_interest = Array.isArray(body.future_interest) ? body.future_interest.map(i => clean(i, 100)) : [];
  const tradition_safety_notes = clean(body.tradition_safety_notes, 2000);
  const test_question_notes = clean(body.test_question_notes, 2000);
  const additional_notes = clean(body.additional_notes, 2000);

  if (!name || !tradition || !primary_language || !tester_count || !disciple_language || !whatsapp || !disciple_private_testing || !internal_beta_listing_permission || !donation_support_preference || !body.consent) {
    return NextResponse.json({ error: 'कृपया सभी आवश्यक विवरण और सहमति पूर्ण करें।' }, { status: 400 });
  }

  const applicationId = randomUUID();
  const notification = await notifyAdmin({ 
    name, organization_name, tradition, primary_language, tester_count, disciple_language, 
    whatsapp, email, disciple_private_testing, internal_beta_listing_permission, donation_support_preference, 
    future_interest, tradition_safety_notes, test_question_notes, additional_notes, consent: true 
  });
  
  let stored = false;
  let storageError = '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from('guru_beta_applications').insert({
      id: applicationId,
      name,
      organization_name,
      tradition,
      primary_language,
      tester_count,
      disciple_language,
      whatsapp,
      email,
      disciple_private_testing,
      internal_beta_listing_permission,
      donation_support_preference,
      future_interest,
      tradition_safety_notes,
      test_question_notes,
      additional_notes,
      consent: true,
      status: 'pending',
      email_delivery_status: notification.status,
      email_delivery_error: 'error' in notification ? notification.error : null,
    });
    if (error) {
      storageError = error.message;
      console.error('[guru-beta/apply] Supabase insert failed', error.message);
    } else stored = true;
  } else storageError = 'Supabase environment variables are unavailable.';

  if (!stored && notification.status !== 'sent') {
    console.error('[guru-beta/apply] Application delivery unavailable', storageError);
    return NextResponse.json({ error: 'आवेदन अभी सुरक्षित नहीं हो सका। कृपया कुछ समय बाद पुनः प्रयास करें।' }, { status: 500 });
  }

  // As long as it was sent via email, or stored in supabase, we return success.
  return NextResponse.json({ success: true, applicationId });
}
