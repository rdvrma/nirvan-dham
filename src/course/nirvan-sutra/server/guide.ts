// SERVER ONLY: the guided half of the Nididhyasana phase — the weekly session (live link, recording, a short note, same for everyone in that
// week) and a guide's note to one learner for one week. Supabase: ns_guide_weeks / ns_guide_notes / ns_guides (supabase/nirvan-sutra-v2.sql);
// locally a JSON file under .data/nirvan-sutra/. Guides see attendance, reflection counts and doubts; the reflections themselves stay private.
import fs from 'node:fs';
import path from 'node:path';
import type { Progress } from '../types';
import { storeMode } from './store';

export interface GuideWeek { week: number; liveSessionUrl: string | null; recordingUrl: string | null; sessionNote: string | null }
export interface GuideStore {
  weeks(): Promise<Record<number, GuideWeek>>;
  saveWeek(w: GuideWeek): Promise<void>;
  notesFor(learnerId: string): Promise<Record<number, string>>;
  allNotes(): Promise<Record<string, Record<number, string>>>;
  saveNote(learnerId: string, week: number, note: string, guideId: string | null): Promise<void>;
  learners(): Promise<Progress[]>;
}

type FileShape = { weeks: Record<number, GuideWeek>; notes: Record<string, Record<number, string>> };
export class FileGuideStore implements GuideStore {
  constructor(private file = path.join(process.cwd(), '.data', 'nirvan-sutra', 'guide.json'), private progressDir = path.join(process.cwd(), '.data', 'nirvan-sutra', 'progress')) {}
  private read(): FileShape { return fs.existsSync(this.file) ? JSON.parse(fs.readFileSync(this.file, 'utf8')) : { weeks: {}, notes: {} }; }
  private write(d: FileShape) { fs.mkdirSync(path.dirname(this.file), { recursive: true }); const tmp = `${this.file}.${process.pid}.tmp`; fs.writeFileSync(tmp, JSON.stringify(d, null, 1)); fs.renameSync(tmp, this.file); }
  async weeks() { return this.read().weeks; }
  async saveWeek(w: GuideWeek) { const d = this.read(); d.weeks[w.week] = w; this.write(d); }
  async notesFor(id: string) { return this.read().notes[id] ?? {}; }
  async allNotes() { return this.read().notes; }
  async saveNote(id: string, week: number, note: string) { const d = this.read(); const n = (d.notes[id] ??= {}); if (note) n[week] = note; else delete n[week]; this.write(d); }
  async learners() {
    if (!fs.existsSync(this.progressDir)) return [];
    return fs.readdirSync(this.progressDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(this.progressDir, f), 'utf8')) as Progress);
  }
}

export class MemoryGuideStore implements GuideStore {
  w: Record<number, GuideWeek> = {}; n: Record<string, Record<number, string>> = {}; l: Progress[] = [];
  async weeks() { return structuredClone(this.w); }
  async saveWeek(w: GuideWeek) { this.w[w.week] = { ...w }; }
  async notesFor(id: string) { return { ...(this.n[id] ?? {}) }; }
  async allNotes() { return structuredClone(this.n); }
  async saveNote(id: string, week: number, note: string) { const n = (this.n[id] ??= {}); if (note) n[week] = note; else delete n[week]; }
  async learners() { return structuredClone(this.l); }
}

const fileGuide = new FileGuideStore();
let override: GuideStore | null = null;
export const setGuideStore = (s: GuideStore | null) => { override = s; };
export async function guideStore(): Promise<GuideStore> {
  if (override) return override;
  if (storeMode() === 'supabase') return (await import('./supabase-guide')).supabaseGuideStore();
  return fileGuide;
}

/** Locally (no accounts) the guide panel is open in development only; with accounts, only users listed in ns_guides. */
export async function isGuide(): Promise<boolean> {
  if (override) return true;
  if (storeMode() !== 'supabase') return process.env.NODE_ENV !== 'production';
  return (await import('./supabase-guide')).callerIsGuide();
}

export const cleanUrl = (v: unknown): string | null => {
  if (v == null || v === '') return null;
  if (typeof v !== 'string') throw new Error('url expected');
  const s = v.trim();
  if (!s) return null;
  let u: URL;
  try { u = new URL(s); } catch { throw new Error('not a valid link'); }
  if (u.protocol !== 'https:') throw new Error('links must start with https://');
  return u.toString();
};
