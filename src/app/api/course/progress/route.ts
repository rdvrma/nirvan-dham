// src/app/api/course/progress/route.ts
// POST /api/course/progress
// Saves chapter completion progress to a log file in the project root.
// Replace with a database write when Supabase is integrated.

import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LOG_FILE = join(process.cwd(), 'course-progress-log.json');

interface ProgressEntry {
  sessionId: string;
  lang: string;
  chapterCompleted: number;
  mcqScore?: number;
  savedAt: string;
}

function readLog(): ProgressEntry[] {
  if (!existsSync(LOG_FILE)) return [];
  try {
    const raw = readFileSync(LOG_FILE, 'utf-8');
    return JSON.parse(raw) as ProgressEntry[];
  } catch {
    return [];
  }
}

function writeLog(entries: ProgressEntry[]): void {
  writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const { sessionId, lang, chapterCompleted, mcqScore } = body as {
      sessionId?: string;
      lang?: string;
      chapterCompleted?: number;
      mcqScore?: number;
    };

    // ── Basic validation ───────────────────────────────────────────────────────
    if (!lang || typeof chapterCompleted !== 'number') {
      return NextResponse.json(
        { error: "Missing required fields: 'lang' and 'chapterCompleted' are required." },
        { status: 400 },
      );
    }

    const entry: ProgressEntry = {
      sessionId: sessionId ?? 'anonymous',
      lang,
      chapterCompleted,
      mcqScore,
      savedAt: new Date().toISOString(),
    };

    // ── Append to log ──────────────────────────────────────────────────────────
    const log = readLog();
    log.push(entry);
    writeLog(log);

    console.log(
      `[Course Progress] session=${entry.sessionId} lang=${lang} chapter=${chapterCompleted} score=${mcqScore ?? 'N/A'}`,
    );

    return NextResponse.json({ success: true, savedAt: entry.savedAt }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/course/progress] Error:', err);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
