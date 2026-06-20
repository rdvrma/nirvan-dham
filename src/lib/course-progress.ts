// ─────────────────────────────────────────────────────────────
//  src/lib/course-progress.ts
//  Client-side progress manager using localStorage
// ─────────────────────────────────────────────────────────────

import type { CourseLanguage } from './course-data';

const STORAGE_KEY = 'nirvan_sutra_progress';

export interface ChapterProgress {
  completed: boolean;
  mcqScore?: number;       // 0–100
  completedAt?: string;    // ISO timestamp
}

export interface CourseProgress {
  language: CourseLanguage | null;
  chapters: Record<number, ChapterProgress>;
  finalTestSubmitted: boolean;
  startedAt?: string;
  lastUpdatedAt?: string;
}

// ─── Default state ─────────────────────────────────────────────────────────────

function defaultProgress(): CourseProgress {
  return {
    language: null,
    chapters: {},
    finalTestSubmitted: false,
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
}

// ─── Read / Write helpers ─────────────────────────────────────────────────────

function readProgress(): CourseProgress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) } as CourseProgress;
  } catch {
    return defaultProgress();
  }
}

function writeProgress(progress: CourseProgress): void {
  if (typeof window === 'undefined') return;
  try {
    progress.lastUpdatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage quota exceeded or SSR – silently ignore
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/** Get the full progress object */
export function getProgress(): CourseProgress {
  return readProgress();
}

/** Set the selected course language */
export function setLanguage(lang: CourseLanguage): void {
  const progress = readProgress();
  progress.language = lang;
  if (!progress.startedAt) {
    progress.startedAt = new Date().toISOString();
  }
  writeProgress(progress);
}

/** Get the currently selected language (or null if not chosen yet) */
export function getLanguage(): CourseLanguage | null {
  return readProgress().language;
}

/**
 * Mark a chapter as completed and optionally record its MCQ score.
 * @param chapterNum  1-based chapter number
 * @param mcqScore    0–100 percentage score (optional)
 */
export function markChapterCompleted(chapterNum: number, mcqScore?: number): void {
  const progress = readProgress();
  progress.chapters[chapterNum] = {
    completed: true,
    mcqScore,
    completedAt: new Date().toISOString(),
  };
  writeProgress(progress);
}

/** Returns true if the given chapter is marked complete */
export function isChapterCompleted(chapterNum: number): boolean {
  const progress = readProgress();
  return progress.chapters[chapterNum]?.completed === true;
}

/** Returns all completed chapter numbers as a sorted array */
export function getCompletedChapters(): number[] {
  const progress = readProgress();
  return Object.entries(progress.chapters)
    .filter(([, v]) => v.completed)
    .map(([k]) => Number(k))
    .sort((a, b) => a - b);
}

/** Get the MCQ score for a specific chapter (or undefined if not yet taken) */
export function getChapterMcqScore(chapterNum: number): number | undefined {
  return readProgress().chapters[chapterNum]?.mcqScore;
}

/** Mark the final test as submitted */
export function markFinalTestSubmitted(): void {
  const progress = readProgress();
  progress.finalTestSubmitted = true;
  writeProgress(progress);
}

/** Returns true if the final test has been submitted */
export function isFinalTestSubmitted(): boolean {
  return readProgress().finalTestSubmitted;
}

/**
 * Calculate overall course completion percentage (0–100).
 * Based on completed chapters out of 8.
 */
export function getCourseCompletionPercent(totalChapters = 8): number {
  const completed = getCompletedChapters().length;
  return Math.round((completed / totalChapters) * 100);
}

/** Reset all progress (e.g., for testing or user-initiated reset) */
export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
