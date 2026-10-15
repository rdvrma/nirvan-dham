// SERVER ONLY: progress in Supabase (supabase/nirvan-sutra-v2.sql). Every call goes through the signed-in user's own session, so row-level
// security decides what can be read or written: a learner only their own row, a guide (ns_guides) can read all rows. No service key is used.
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import type { Progress } from '../types';
import type { ProgressStore } from './store';

export class SupabaseProgressStore implements ProgressStore {
  constructor(private db: SupabaseClient) {}
  async get(learnerId: string): Promise<Progress | null> {
    const { data, error } = await this.db.from('ns_progress').select('progress').eq('user_id', learnerId).maybeSingle();
    if (error) throw new Error(`ns_progress read failed: ${error.message}`);
    return data ? ({ ...(data.progress as Progress), learnerId }) : null;
  }
  async save(p: Progress): Promise<void> {
    const doc: Progress = { ...p, updatedAt: new Date().toISOString() };
    const { error } = await this.db.from('ns_progress').upsert({ user_id: p.learnerId, progress: doc, locale: p.locale, stages_completed: p.stagesCompleted.length }, { onConflict: 'user_id' });
    if (error) throw new Error(`ns_progress write failed: ${error.message}`);
  }
  /** Guides only (RLS returns just the caller's own row to anyone else). */
  async all(): Promise<Progress[]> {
    const { data, error } = await this.db.from('ns_progress').select('user_id, progress').order('updated_at', { ascending: false }).limit(500);
    if (error) throw new Error(`ns_progress list failed: ${error.message}`);
    return (data ?? []).map((r) => ({ ...(r.progress as Progress), learnerId: r.user_id as string }));
  }
}

export async function supabaseClient() { return createClient(); }
export async function supabaseProgressStore() { return new SupabaseProgressStore(await createClient()); }
