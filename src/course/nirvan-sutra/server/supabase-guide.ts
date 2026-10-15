// SERVER ONLY: the guide data in Supabase, through the caller's own session (RLS: only ns_guides members may write or read others' rows).
import { createClient } from '@/utils/supabase/server';
import type { GuideStore, GuideWeek } from './guide';
import { SupabaseProgressStore } from './supabase-store';

export async function supabaseGuideStore(): Promise<GuideStore> {
  const db = await createClient();
  const fail = (what: string, e: { message: string }) => { throw new Error(`${what} failed: ${e.message}`); };
  return {
    async weeks() {
      const { data, error } = await db.from('ns_guide_weeks').select('week, live_session_url, recording_url, session_note');
      if (error) fail('ns_guide_weeks read', error);
      return Object.fromEntries((data ?? []).map((r) => [r.week, { week: r.week, liveSessionUrl: r.live_session_url, recordingUrl: r.recording_url, sessionNote: r.session_note } as GuideWeek]));
    },
    async saveWeek(w) {
      const { error } = await db.from('ns_guide_weeks').upsert({ week: w.week, live_session_url: w.liveSessionUrl, recording_url: w.recordingUrl, session_note: w.sessionNote }, { onConflict: 'week' });
      if (error) fail('ns_guide_weeks write', error);
    },
    async notesFor(learnerId) {
      const { data, error } = await db.from('ns_guide_notes').select('week, note').eq('learner_id', learnerId);
      if (error) fail('ns_guide_notes read', error);
      return Object.fromEntries((data ?? []).map((r) => [r.week, r.note as string]));
    },
    async allNotes() {
      const { data, error } = await db.from('ns_guide_notes').select('learner_id, week, note');
      if (error) fail('ns_guide_notes list', error);
      const out: Record<string, Record<number, string>> = {};
      for (const r of data ?? []) (out[r.learner_id] ??= {})[r.week] = r.note;
      return out;
    },
    async saveNote(learnerId, week, note, guideId) {
      const q = note
        ? db.from('ns_guide_notes').upsert({ learner_id: learnerId, week, note, guide_id: guideId }, { onConflict: 'learner_id,week' })
        : db.from('ns_guide_notes').delete().eq('learner_id', learnerId).eq('week', week);
      const { error } = await q;
      if (error) fail('ns_guide_notes write', error);
    },
    async learners() { return new SupabaseProgressStore(db).all(); },
  };
}

export async function callerIsGuide(): Promise<boolean> {
  const db = await createClient();
  const { data, error } = await db.rpc('ns_is_guide');
  return !error && data === true;
}
