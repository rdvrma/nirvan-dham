'use client';
// Small interactive pieces: the private reflection box, the stage-completion button, the visit marker.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { act, BASE } from './api';
import { useCourse } from './CourseShell';

export function Reflection({ k, initial, prompt }: { k: string; initial: string; prompt: string }) {
  const { ui, toast } = useCourse();
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); try { await act('reflection', { key: k, text: v }); setSaved(v); toast(ui.saved); } finally { setBusy(false); } };
  return (
    <div className="ns-stack">
      <label className="ns-lead" htmlFor={`ref-${k}`} style={{ display: 'block' }}>{prompt}</label>
      <textarea id={`ref-${k}`} className="ns-textarea" value={v} onChange={(e) => setV(e.target.value)} placeholder={ui.reflectionPlaceholder} maxLength={8000} />
      <div className="ns-row"><button className="ns-btn ns-btn-quiet" onClick={save} disabled={busy || v === saved}>{v === saved && saved ? ui.saved : ui.save}</button></div>
    </div>
  );
}

export function CompleteStage({ stage, ready }: { stage: string; ready: boolean }) {
  const { ui, toast } = useCourse();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try { await act('complete-stage', { stage }); router.push(`${BASE}/stage/${stage}/complete`); router.refresh(); }
    catch (e) { toast((e as Error).message); setBusy(false); }
  };
  return <button className="ns-btn" onClick={go} disabled={!ready || busy}>{ui.completeStage}</button>;
}

/** Records where the learner is, for “continue where you left off”. */
export function Visit({ kind, id }: { kind: string; id: string }) {
  useEffect(() => { act('visit', { kind, id }).catch(() => {}); }, [kind, id]);
  return null;
}

/** Long text shown in part until asked for (progressive disclosure). */
export function MoreText({ text, limit = 260 }: { text: string; limit?: number }) {
  const { ui } = useCourse();
  const [open, setOpen] = useState(false);
  const long = [...text].length > limit;
  const shown = !long || open ? text : `${[...text].slice(0, limit).join('').replace(/\s+\S*$/, '')}…`;
  return (
    <div>
      <p className="ns-lead">{shown}</p>
      {long && <button className="ns-btn ns-btn-quiet" style={{ marginTop: 12, minHeight: 38, padding: '6px 16px' }} onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? ui.readLess : ui.readMore}</button>}
    </div>
  );
}
