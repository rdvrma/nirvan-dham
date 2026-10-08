// SERVER ONLY: where learner progress is kept. Locally a JSON file per learner under .data/nirvan-sutra/ (git-ignored); the interface is the seam for the
// Supabase table later (same shape, one row per learner). Scores are written only by the server's grading routes, never taken from the client.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Progress } from '../types';
import { newProgress } from '../engine';

export interface ProgressStore {
  get(learnerId: string): Promise<Progress | null>;
  save(p: Progress): Promise<void>;
}

export class FileProgressStore implements ProgressStore {
  constructor(private dir = path.join(process.cwd(), '.data', 'nirvan-sutra', 'progress')) {}
  private file(id: string) { if (!/^[a-zA-Z0-9-]{8,64}$/.test(id)) throw new Error('bad learner id'); return path.join(this.dir, `${id}.json`); }
  async get(id: string) { const f = this.file(id); return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, 'utf8')) as Progress) : null; }
  async save(p: Progress) {
    fs.mkdirSync(this.dir, { recursive: true });
    const f = this.file(p.learnerId), tmp = `${f}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ ...p, updatedAt: new Date().toISOString() }, null, 1));
    fs.renameSync(tmp, f);
  }
}

export class MemoryProgressStore implements ProgressStore {
  private m = new Map<string, Progress>();
  async get(id: string) { const p = this.m.get(id); return p ? structuredClone(p) : null; }
  async save(p: Progress) { this.m.set(p.learnerId, structuredClone({ ...p, updatedAt: new Date().toISOString() })); }
}

let store: ProgressStore = new FileProgressStore();
export const progressStore = () => store;
/** Tests swap the store. */
export const setProgressStore = (s: ProgressStore) => { store = s; };

export async function loadOrCreate(learnerId: string): Promise<Progress> {
  return (await store.get(learnerId)) ?? newProgress(learnerId);
}
/** Load, change and save in one step. */
export async function update(learnerId: string, fn: (p: Progress) => Progress | void): Promise<Progress> {
  const p = await loadOrCreate(learnerId);
  const next = fn(p) ?? p;
  await store.save(next);
  return next;
}
export const newLearnerId = () => randomUUID();
