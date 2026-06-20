// src/app/api/course/submit/route.ts
// POST /api/course/submit
// Handles final test submissions.
// Saves to course-submissions.json in the project root.
// Sends email notification via Nodemailer (if SMTP env vars are set).

import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import nodemailer from 'nodemailer';

const SUBMISSIONS_FILE = join(process.cwd(), 'course-submissions.json');

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AnswerEntry {
  question: string;
  answer: string;
}

interface SubmitPayload {
  name: string;
  email: string;
  phone: string;
  language: string;
  answers: AnswerEntry[];
}

interface Submission extends SubmitPayload {
  submittedAt: string;
}

// ─── File helpers ──────────────────────────────────────────────────────────────

function readSubmissions(): Submission[] {
  if (!existsSync(SUBMISSIONS_FILE)) return [];
  try {
    const raw = readFileSync(SUBMISSIONS_FILE, 'utf-8');
    return JSON.parse(raw) as Submission[];
  } catch {
    return [];
  }
}

function saveSubmission(submission: Submission): void {
  const all = readSubmissions();
  all.push(submission);
  writeFileSync(SUBMISSIONS_FILE, JSON.stringify(all, null, 2), 'utf-8');
}

// ─── Email helper ──────────────────────────────────────────────────────────────

async function sendEmailNotification(submission: Submission): Promise<void> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL ?? smtpUser;

  if (!smtpUser || !smtpPass || !adminEmail) {
    // No SMTP configured — log to console instead
    console.log('─── [Course Submit] New Submission ───────────────────────────');
    console.log(`Name     : ${submission.name}`);
    console.log(`Email    : ${submission.email}`);
    console.log(`Phone    : ${submission.phone}`);
    console.log(`Language : ${submission.language}`);
    console.log(`Time     : ${submission.submittedAt}`);
    console.log(`Answers  : ${submission.answers.length} responses`);
    submission.answers.forEach((a, i) => {
      console.log(`  Q${i + 1}: ${a.question}`);
      console.log(`  A${i + 1}: ${a.answer}`);
    });
    console.log('──────────────────────────────────────────────────────────────');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
    });

    const answersHtml = submission.answers
      .map(
        (a, i) =>
          `<tr>
            <td style="padding:6px;border:1px solid #ddd;vertical-align:top;font-weight:bold;">Q${i + 1}: ${escapeHtml(a.question)}</td>
            <td style="padding:6px;border:1px solid #ddd;">${escapeHtml(a.answer)}</td>
          </tr>`,
      )
      .join('');

    await transporter.sendMail({
      from: `"Nirvan Sutra Course" <${smtpUser}>`,
      to: adminEmail,
      subject: `[Nirvan Sutra] New Final Test Submission — ${submission.name}`,
      html: `
        <h2 style="color:#6b4c2a;">Nirvan Sutra Course — Final Test Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(submission.phone)}</p>
        <p><strong>Language:</strong> ${escapeHtml(submission.language)}</p>
        <p><strong>Submitted At:</strong> ${submission.submittedAt}</p>
        <h3>Answers</h3>
        <table style="border-collapse:collapse;width:100%;">${answersHtml}</table>
      `,
    });

    console.log(`[Course Submit] Email sent to admin for: ${submission.email}`);
  } catch (err) {
    // Email failure must not break the API response
    console.error('[Course Submit] Email send failed:', err);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as Partial<SubmitPayload>;

    // ── Validation ─────────────────────────────────────────────────────────────
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone' },
        { status: 400 },
      );
    }
    if (!Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json(
        { error: 'answers must be a non-empty array of { question, answer } objects' },
        { status: 400 },
      );
    }

    const submission: Submission = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      language: body.language ?? 'unknown',
      answers: body.answers,
      submittedAt: new Date().toISOString(),
    };

    // ── Persist ────────────────────────────────────────────────────────────────
    saveSubmission(submission);

    // ── Notify (fire-and-forget) ───────────────────────────────────────────────
    sendEmailNotification(submission).catch((err) =>
      console.error('[Course Submit] Notification error:', err),
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Your journey continues...',
        submittedAt: submission.submittedAt,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[POST /api/course/submit] Error:', err);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
