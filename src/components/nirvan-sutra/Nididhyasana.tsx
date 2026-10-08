'use client';
// Phase II: the twelve weeks of guided Nididhyasana. Quiet by design — the week's pointer, the next session, a doubt to send, a journal; no feed, no chat.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { act, BASE, fmt } from './api';
import { useCourse } from './CourseShell';
import { Tick } from './VideoPlayer';

export function BeginNididhyasana({ label }: { label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <button className="ns-btn" disabled={busy} onClick={async () => { setBusy(true); await act('nididhyasana', { op: 'start' }); router.push(`${BASE}/nididhyasana`); router.refresh(); }}>{label}</button>;
}

export interface WeekView { n: number; theme: string; pointer: string; reflectionPrompt: string; sessionDate: string; sessionStatus: 'past' | 'now' | 'upcoming'; liveSessionUrl: string | null; recordingUrl: string | null; teacherNote: string | null; attended: boolean; reflection: string; doubts: { text: string; at: string }[] }

export default function NididhyasanaBoard({ weeks, current, participation }: { weeks: WeekView[]; current: number; participation: { attended: number; reflections: number; needAttended: number; needReflections: number } }) {
  const { ui, toast } = useCourse();
  const router = useRouter();
  const cur = Math.min(current, 12);
  const [sel, setSel] = useState(cur);
  const w = weeks[sel - 1];
  const [reflection, setReflection] = useState(w.reflection);
  const [doubt, setDoubt] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (op: string, extra: Record<string, unknown> = {}, msg?: string) => {
    setBusy(true);
    try { await act('nididhyasana', { op, week: sel, ...extra }); if (msg) toast(msg); router.refresh(); } catch (e) { toast((e as Error).message); } finally { setBusy(false); }
  };
  const open = sel <= cur;
  return (
    <div className="ns-stack-l">
      <section aria-label={ui.nidProgress}>
        <div className="ns-section-head"><h2 className="ns-h3">{ui.nidProgress}</h2><span className="ns-small ns-muted">{fmt(ui.nidParticipation, { a: participation.attended, b: participation.needAttended, c: participation.reflections, d: participation.needReflections })}</span></div>
        <div className="ns-weeks" role="tablist">
          {weeks.map((x) => (
            <button key={x.n} role="tab" aria-selected={sel === x.n} className="ns-week" data-state={x.sessionStatus} data-attended={x.attended} onClick={() => { setSel(x.n); setReflection(x.reflection); }} style={{ cursor: 'pointer', outline: sel === x.n ? '1px solid var(--ns-gold-2)' : undefined }} aria-label={fmt(ui.nidWeekOf, { n: x.n })}>
              {x.n}
            </button>
          ))}
        </div>
      </section>

      <section className="ns-panel ns-panel-glow" key={sel} style={{ animation: 'ns-rise 600ms var(--ns-ease) both' }}>
        <div className="ns-eyebrow">{fmt(ui.nidWeekOf, { n: w.n })}{w.sessionStatus === 'now' ? ` · ${ui.nidThisWeek}` : ''}</div>
        <h2 className="ns-h2" style={{ marginTop: 10 }}>{w.theme}</h2>
        <div style={{ marginTop: 18 }}><div className="ns-small ns-muted">{ui.nidPointer}</div><p className="ns-lead" style={{ marginTop: 6 }}>{w.pointer}</p></div>
      </section>

      <div className="ns-grid-2">
        <section className="ns-panel">
          <div className="ns-eyebrow">{w.sessionStatus === 'past' ? ui.nidArchive : ui.nidUpcoming}</div>
          <p className="ns-h3" style={{ marginTop: 10 }}>{w.sessionDate}</p>
          {w.sessionStatus === 'past'
            ? <p className="ns-muted ns-small" style={{ marginTop: 8 }}>{w.recordingUrl ? <a className="ns-gold" href={w.recordingUrl}>{ui.open}</a> : ui.nidRecordingSoon}</p>
            : w.liveSessionUrl ? <a className="ns-btn" style={{ marginTop: 14 }} href={w.liveSessionUrl}>{ui.nidJoin}</a> : <p className="ns-muted ns-small" style={{ marginTop: 8 }}>{ui.nidSessionPending}</p>}
          {w.teacherNote && <div style={{ marginTop: 14 }}><div className="ns-small ns-muted">{ui.nidTeacherNote}</div><p>{w.teacherNote}</p></div>}
          {open && (w.attended
            ? <p className="ns-small" style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}><Tick /> {ui.nidAttendedDone}</p>
            : <button className="ns-btn ns-btn-quiet" style={{ marginTop: 14 }} disabled={busy} onClick={() => run('attend', {}, ui.nidAttendedDone)}>{ui.nidAttended}</button>)}
        </section>
        <section className="ns-panel">
          <div className="ns-eyebrow">{ui.nidDoubt}</div>
          <textarea className="ns-textarea" style={{ marginTop: 12, minHeight: 100 }} value={doubt} onChange={(e) => setDoubt(e.target.value)} placeholder={ui.nidDoubtPlaceholder} disabled={!open} aria-label={ui.nidDoubt} maxLength={2000} />
          <button className="ns-btn ns-btn-quiet" style={{ marginTop: 10 }} disabled={!open || busy || doubt.trim().length < 3} onClick={async () => { await run('doubt', { text: doubt }, ui.nidDoubtSent); setDoubt(''); }}>{ui.submit}</button>
          {w.doubts.length > 0 && <ul className="ns-small ns-muted" style={{ marginTop: 12, listStyle: 'none' }}>{w.doubts.map((d, i) => <li key={i}>· {d.text}</li>)}</ul>}
        </section>
      </div>

      <section className="ns-panel">
        <div className="ns-eyebrow">{ui.nidJournal}</div>
        <label className="ns-lead" htmlFor="nid-ref" style={{ display: 'block', marginTop: 10 }}>{w.reflectionPrompt}</label>
        <textarea id="nid-ref" className="ns-textarea" style={{ marginTop: 12 }} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder={ui.reflectionPlaceholder} disabled={!open} maxLength={8000} />
        <button className="ns-btn ns-btn-quiet" style={{ marginTop: 10 }} disabled={!open || busy || reflection === w.reflection} onClick={() => run('reflect', { text: reflection }, ui.saved)}>{ui.save}</button>
      </section>
    </div>
  );
}
