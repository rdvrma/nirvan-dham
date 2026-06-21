import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import questionData from '@/content/programs/nirvan-shakti-snan-pravesh-prashn.json';

export const runtime = 'nodejs';

interface ApplicationPayload {
  name?: string;
  email?: string;
  whatsapp?: string;
  location?: string;
  language?: string;
  answers?: Record<string, string>;
  consent?: boolean;
  website?: string;
}

const recentRequests = new Map<string, number[]>();
const validLanguages = new Set(['Hindi', 'English', 'Hinglish']);

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

async function notifyAdmin(application: {
  name: string;
  email: string;
  whatsapp: string;
  location: string;
  language: string;
  answers: Array<{ id: string; category: string; prompt: string; answer: string }>;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_APP_PASSWORD ?? process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL ?? smtpUser;
  if (!smtpUser || !smtpPass || !adminEmail) return { status: 'not_configured', error: 'SMTP is not configured.' } as const;

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: smtpUser, pass: smtpPass } });
    const rows = application.answers.map((entry, index) => `
      <tr>
        <td style="padding:12px;border:1px solid #ded3b5;vertical-align:top;width:38%;">
          <small style="color:#8a651c;">${escapeHtml(entry.category)}</small><br>
          <strong>${index + 1}. ${escapeHtml(entry.prompt)}</strong>
        </td>
        <td style="padding:12px;border:1px solid #ded3b5;vertical-align:top;white-space:pre-wrap;">${escapeHtml(entry.answer)}</td>
      </tr>`).join('');

    await transporter.sendMail({
      from: `"Nirvan Shakti Snan" <${smtpUser}>`,
      to: adminEmail,
      replyTo: application.email,
      subject: `[Shakti Snan] नया प्रवेश आवेदन - ${application.name}`,
      html: `<div style="font-family:Arial,sans-serif;color:#172219;max-width:920px;margin:auto;">
        <h2 style="color:#8a651c;">Nirvan Shakti Snan Sadhna</h2>
        <p><strong>नाम:</strong> ${escapeHtml(application.name)}</p>
        <p><strong>ईमेल:</strong> ${escapeHtml(application.email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(application.whatsapp)}</p>
        <p><strong>स्थान:</strong> ${escapeHtml(application.location)}</p>
        <p><strong>भाषा:</strong> ${escapeHtml(application.language)}</p>
        <h3 style="color:#8a651c;">प्रवेश प्रश्नों के उत्तर</h3>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
      </div>`,
    });
    return { status: 'sent' } as const;
  } catch (error) {
    console.error('[shakti-snan/apply] Email delivery failed', error);
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
  const email = clean(body.email, 180).toLowerCase();
  const whatsapp = clean(body.whatsapp, 40);
  const location = clean(body.location, 160);
  const language = clean(body.language, 20);

  if (!name || !email || !whatsapp || !location || !validLanguages.has(language) || !body.consent) {
    return NextResponse.json({ error: 'कृपया सभी आवश्यक विवरण और सहमति पूर्ण करें।' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'कृपया सही ईमेल पता लिखें।' }, { status: 400 });
  }

  const submittedAnswers = body.answers || {};
  const answers = questionData.questions.map((question) => ({
    id: question.id,
    category: question.category,
    prompt: question.prompt,
    answer: clean(submittedAnswers[question.id], 6000),
  }));
  if (answers.some((entry) => !entry.answer)) {
    return NextResponse.json({ error: 'सभी 9 प्रवेश प्रश्नों के उत्तर आवश्यक हैं।' }, { status: 400 });
  }

  const applicationId = randomUUID();
  const notification = await notifyAdmin({ name, email, whatsapp, location, language, answers });
  let stored = false;
  let storageError = '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from('shakti_snan_applications').insert({
      id: applicationId,
      name,
      email,
      whatsapp,
      location,
      preferred_language: language,
      answers,
      consent: true,
      review_status: 'pending',
      email_delivery_status: notification.status,
      email_delivery_error: 'error' in notification ? notification.error : null,
    });
    if (error) {
      storageError = error.message;
      console.error('[shakti-snan/apply] Supabase insert failed', error.message);
    } else stored = true;
  } else storageError = 'Supabase environment variables are unavailable.';

  if (!stored && notification.status !== 'sent') {
    console.error('[shakti-snan/apply] Application delivery unavailable', storageError);
    return NextResponse.json({ error: 'आवेदन अभी सुरक्षित नहीं हो सका। कृपया कुछ समय बाद पुनः प्रयास करें।' }, { status: 500 });
  }

  return NextResponse.json({ success: true, applicationId });
}
