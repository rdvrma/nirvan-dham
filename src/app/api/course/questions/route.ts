// src/app/api/course/questions/route.ts
// GET /api/course/questions?lang=hi&chapter=1
// Returns up to 50 shuffled MCQ questions from the corresponding JSON file.

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

type CourseLang = 'hi' | 'en' | 'hl';
const VALID_LANGS: CourseLang[] = ['hi', 'en', 'hl'];

export interface McqQuestion {
  id: number | string;
  question: string;
  options: string[];
  answer: string;
  [key: string]: unknown;
}

/** Fisher-Yates shuffle (returns a new array) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const lang = searchParams.get('lang') as CourseLang | null;
  const chapterParam = searchParams.get('chapter');

  // ── Validate lang ──────────────────────────────────────────────────────────
  if (!lang || !VALID_LANGS.includes(lang)) {
    return NextResponse.json(
      { error: `Invalid or missing 'lang'. Must be one of: ${VALID_LANGS.join(', ')}` },
      { status: 400 },
    );
  }

  // ── Validate chapter ───────────────────────────────────────────────────────
  const chapter = Number(chapterParam);
  if (!chapterParam || isNaN(chapter) || chapter < 1 || chapter > 8) {
    return NextResponse.json(
      { error: "Invalid or missing 'chapter'. Must be a number between 1 and 8." },
      { status: 400 },
    );
  }

  // ── Resolve file path ──────────────────────────────────────────────────────
  // Reads from src/content/course-mcq/[lang]/chapter-[n].json
  const filePath = join(
    process.cwd(),
    'src',
    'content',
    'course-mcq',
    lang,
    `chapter-${chapter}.json`,
  );

  // ── Read & parse JSON ──────────────────────────────────────────────────────
  let questions: McqQuestion[];
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    // Accept either a top-level array or { questions: [...] }
    questions = Array.isArray(parsed) ? parsed : (parsed.questions ?? []);
  } catch (err: unknown) {
    const isNotFound =
      err instanceof Error &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === 'ENOENT';
    if (isNotFound) {
      return NextResponse.json(
        { error: 'Questions not yet generated' },
        { status: 404 },
      );
    }
    console.error('[GET /api/course/questions] Failed to parse JSON:', err);
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
  }

  // ── Shuffle and return up to 50 ────────────────────────────────────────────
  const shuffled = shuffle(questions).slice(0, 50);

  return NextResponse.json(
    {
      lang,
      chapter,
      total: shuffled.length,
      questions: shuffled,
    },
    { status: 200 },
  );
}
