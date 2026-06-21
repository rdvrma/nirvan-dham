import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  FINAL_TEST_QUESTION_COUNT,
  FINAL_TEST_BANKS,
  isFinalTestLanguage,
  type FinalTestLanguage,
} from '@/lib/final-test-data';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

interface SubmittedAnswer {
  id?: string;
  answer?: string;
}

interface SubmitPayload {
  language?: string;
  phone?: string;
  answers?: SubmittedAnswer[];
}

interface StoredAnswer {
  id: string;
  prompt: string;
  answer: string;
}

function displayLanguage(language: FinalTestLanguage) {
  return language === 'hi' ? 'Hindi' : language === 'hl' ? 'Hinglish' : 'English';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function notifyAdmin({
  name,
  email,
  phone,
  language,
  answers,
}: {
  name: string;
  email: string;
  phone: string;
  language: FinalTestLanguage;
  answers: StoredAnswer[];
}): Promise<{ status: 'sent' | 'failed' | 'not_configured'; error?: string }> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_APP_PASSWORD ?? process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL ?? smtpUser;

  if (!smtpUser || !smtpPass || !adminEmail) {
    return { status: 'not_configured', error: 'SMTP notification variables are not configured.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
    });

    const answerRows = answers
      .map((item, index) => `
        <tr>
          <td style="padding:10px;border:1px solid #e5d7b1;vertical-align:top;font-weight:700;width:34%;">
            ${index + 1}. ${escapeHtml(item.prompt)}
          </td>
          <td style="padding:10px;border:1px solid #e5d7b1;white-space:pre-wrap;">${escapeHtml(item.answer)}</td>
        </tr>`)
      .join('');

    await transporter.sendMail({
      from: `"Nirvan Sutra Course" <${smtpUser}>`,
      to: adminEmail,
      subject: `[Nirvan Sutra] Final Test Submitted - ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#1b271d;max-width:900px;margin:auto;">
          <h2 style="color:#8a651c;">Nirvan Sutra - Final Test Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Language:</strong> ${displayLanguage(language)}</p>
          <h3 style="color:#8a651c;">15 Submitted Answers</h3>
          <table style="border-collapse:collapse;width:100%;">${answerRows}</table>
        </div>`,
    });

    return { status: 'sent' };
  } catch (error) {
    console.error('[course/submit] Gmail notification failed', error);
    return { status: 'failed', error: 'Gmail notification could not be delivered.' };
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { data: progress, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !progress) {
    return NextResponse.json({ error: 'Progress profile is unavailable. Please ensure you are logged in and have started the course.' }, { status: 500 });
  }

  return NextResponse.json({
    name: progress.name || user.user_metadata.name || '',
    email: progress.email || user.email || '',
    phone: progress.phone || '',
    highestChapterUnlocked: progress.highest_chapter_unlocked ?? 1,
    submittedAt: progress.final_test_submitted_at || null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as SubmitPayload | null;
  const language = body?.language;
  const phone = body?.phone?.trim();

  if (!language || !isFinalTestLanguage(language)) {
    return NextResponse.json({ error: 'Invalid course language.' }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required before submitting the final test.' }, { status: 400 });
  }
  if (!Array.isArray(body?.answers) || body.answers.length !== FINAL_TEST_QUESTION_COUNT) {
    return NextResponse.json({ error: `All ${FINAL_TEST_QUESTION_COUNT} answers are required.` }, { status: 400 });
  }

  const ids = new Set<string>();
  const bankById = new Map(FINAL_TEST_BANKS[language].map((question) => [question.id, question]));
  const answers: StoredAnswer[] = [];
  for (const entry of body.answers) {
    const id = entry.id?.trim();
    const answer = entry.answer?.trim();
    const question = id ? bankById.get(id) : undefined;
    if (!id || !answer || !question || ids.has(id)) {
      return NextResponse.json({ error: 'Every answer must belong to a valid, unique final-test question.' }, { status: 400 });
    }
    ids.add(id);
    answers.push({ id, prompt: question.prompt, answer });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (progressError || !progress) {
    return NextResponse.json({ error: 'Progress profile is unavailable. Please ensure you are logged in.' }, { status: 500 });
  }
  if ((progress.highest_chapter_unlocked ?? 1) < 9) {
    return NextResponse.json({ error: 'Complete and pass all eight chapter practices before taking the final test.' }, { status: 403 });
  }
  if (progress.final_test_submitted_at) {
    return NextResponse.json({ error: 'Your final test has already been submitted.' }, { status: 409 });
  }

  const name = progress.name || user.user_metadata.name || 'Nirvan Sutra Seeker';
  const email = progress.email || user.email || '';
  if (!email) return NextResponse.json({ error: 'A verified email address is required.' }, { status: 400 });

  let submissionId = null;
  let submittedAt = new Date().toISOString();

  // 1. Attempt to save to Supabase
  const { data: submission, error: insertError } = await supabase
    .from('course_final_submissions')
    .insert({ user_id: user.id, language, name, email, phone, answers })
    .select('id, submitted_at')
    .single();

  if (insertError) {
    // If it's a duplicate submission error, return 409
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'Your final test has already been submitted.' }, { status: 409 });
    }
    console.error('[course/submit] Could not save to DB (perhaps table is missing), proceeding to email:', insertError.message);
  } else if (submission) {
    submissionId = submission.id;
    submittedAt = submission.submitted_at;
  }

  // 2. Attempt to update progress
  if (submissionId) {
    const { error: updateProgressError } = await supabase
      .from('user_progress')
      .update({
        phone,
        final_test_submitted_at: submittedAt,
        shravana_completed_at: submittedAt,
      })
      .eq('user_id', user.id);
    if (updateProgressError) {
      console.error('[course/submit] Progress completion update failed', updateProgressError);
    }
  }

  // 3. Send Email Notification
  const notification = await notifyAdmin({ name, email, phone, language, answers });
  
  if (submissionId) {
    await supabase.rpc('update_final_submission_delivery_status', {
      target_submission_id: submissionId,
      target_status: notification.status,
      target_error: notification.error ?? null,
    });
  }

  // If both database and email fail, return an error
  if (!submissionId && notification.status !== 'sent') {
    return NextResponse.json({ error: 'Your test could not be saved or emailed due to server configuration issues.' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    submittedAt: submittedAt,
    emailStatus: notification.status,
  });
}
