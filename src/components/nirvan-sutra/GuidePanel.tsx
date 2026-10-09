'use client';
// The guide's desk (Hindi, the guides' language): set the 12 weekly sessions, see who is where, read doubts, write a note per learner per week.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GuideWeek } from '@/course/nirvan-sutra/server/guide';
import type { GuideLearnerView } from '@/course/nirvan-sutra/server/guide-actions';

async function guideAct(action: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/nirvan-sutra-guide/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data;
}

function WeekEditor({ w, theme }: { w: GuideWeek; theme: string }) {
  const [live, setLive] = useState(w.liveSessionUrl ?? '');
  const [rec, setRec] = useState(w.recordingUrl ?? '');
  const [note, setNote] = useState(w.sessionNote ?? '');
  const [msg, setMsg] = useState('');
  const save = async () => {
    setMsg('…');
    try { await guideAct('week', { week: w.week, liveSessionUrl: live, recordingUrl: rec, sessionNote: note }); setMsg('सहेजा गया'); } catch (e) { setMsg((e as Error).message); }
  };
  return (
    <div className="ns-panel" style={{ padding: 16 }}>
      <div className="ns-eyebrow">सप्ताह {w.week}</div>
      <div className="ns-h3" style={{ marginTop: 4 }}>{theme}</div>
      <label className="ns-label" style={{ marginTop: 10, display: 'block' }}>लाइव सत्र का लिंक (https://…)<input className="ns-input" value={live} onChange={(e) => setLive(e.target.value)} placeholder="https://meet…" /></label>
      <label className="ns-label" style={{ marginTop: 8, display: 'block' }}>रिकॉर्डिंग का लिंक<input className="ns-input" value={rec} onChange={(e) => setRec(e.target.value)} placeholder="https://…" /></label>
      <label className="ns-label" style={{ marginTop: 8, display: 'block' }}>सबके लिए सत्र-टिप्पणी<textarea className="ns-textarea" rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></label>
      <div className="ns-row" style={{ marginTop: 10, gap: 12, alignItems: 'center' }}><button className="ns-btn" onClick={save}>सहेजें</button><span className="ns-small ns-muted" role="status">{msg}</span></div>
    </div>
  );
}

function LearnerCard({ l }: { l: GuideLearnerView }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>(Object.fromEntries(l.weeks.map((w) => [w.n, w.note])));
  const [msg, setMsg] = useState('');
  const doubts = l.weeks.reduce((s, w) => s + w.doubts.length, 0);
  const save = async (n: number) => {
    setMsg('…');
    try { await guideAct('note', { learnerId: l.id, week: n, note: notes[n] ?? '' }); setMsg(`सप्ताह ${n} की टिप्पणी सहेजी गई`); router.refresh(); } catch (e) { setMsg((e as Error).message); }
  };
  return (
    <div className="ns-panel" style={{ padding: 16 }}>
      <button className="ns-btn-quiet" onClick={() => setOpen(!open)} aria-expanded={open} style={{ width: '100%', textAlign: 'left' }}>
        <strong>{l.name || 'साधक'}</strong> <span className="ns-small ns-muted">· {l.locale ?? '—'} · {l.inNididhyasana ? `सप्ताह ${Math.min(12, l.currentWeek ?? 1)} · उपस्थिति ${l.attended}/12 · चिंतन ${l.reflections}/12` : `ज्ञान-यात्रा: ${l.stagesCompleted}/17 सोपान`}{doubts ? ` · ${doubts} शंका` : ''}{l.finalReflectionDone ? ' · अंतिम चिंतन जमा' : ''}</span>
      </button>
      {open && l.inNididhyasana && (
        <div className="ns-stack" style={{ marginTop: 12 }}>
          <p className="ns-small ns-muted">साधक के चिंतन निजी हैं — यहाँ केवल यह दिखता है कि लिखा गया या नहीं।</p>
          {l.weeks.filter((w) => w.n <= Math.min(12, l.currentWeek ?? 12)).map((w) => (
            <div key={w.n} style={{ borderTop: '1px solid var(--ns-line-2)', paddingTop: 10 }}>
              <div className="ns-small"><strong>सप्ताह {w.n}</strong> · {w.attended ? 'उपस्थित' : 'अनुपस्थित'} · {w.wroteReflection ? 'चिंतन लिखा' : 'चिंतन नहीं'}</div>
              {w.doubts.length > 0 && <ul className="ns-small" style={{ marginTop: 6, listStyle: 'none' }}>{w.doubts.map((d, i) => <li key={i}>शंका: {d.text}</li>)}</ul>}
              <textarea className="ns-textarea" rows={2} style={{ marginTop: 6 }} placeholder="इस सप्ताह के लिए आपकी टिप्पणी / शंका का उत्तर" value={notes[w.n] ?? ''} onChange={(e) => setNotes({ ...notes, [w.n]: e.target.value })} />
              <button className="ns-btn ns-btn-quiet" style={{ marginTop: 6 }} onClick={() => save(w.n)}>टिप्पणी सहेजें</button>
            </div>
          ))}
          <span className="ns-small ns-muted" role="status">{msg}</span>
        </div>
      )}
    </div>
  );
}

export default function GuidePanel({ weeks, themes, learners }: { weeks: GuideWeek[]; themes: { n: number; theme: string }[]; learners: GuideLearnerView[] }) {
  const nid = learners.filter((l) => l.inNididhyasana);
  const rest = learners.filter((l) => !l.inNididhyasana);
  return (
    <section className="ns-stack-l">
      <header>
        <div className="ns-eyebrow">निदिध्यासन संग · मार्गदर्शक</div>
        <h1 className="ns-h1" style={{ marginTop: 8 }}>मार्गदर्शक का पटल</h1>
        <p className="ns-muted" style={{ marginTop: 8 }}>बारह साप्ताहिक सत्रों के लिंक, और हर साधक की उपस्थिति, शंकाएँ और आपकी टिप्पणियाँ।</p>
      </header>
      <div>
        <h2 className="ns-h2">बारह सप्ताह</h2>
        <div className="ns-grid-2" style={{ marginTop: 14 }}>{weeks.map((w) => <WeekEditor key={w.week} w={w} theme={themes.find((t) => t.n === w.week)?.theme ?? ''} />)}</div>
      </div>
      <div>
        <h2 className="ns-h2">निदिध्यासन में साधक ({nid.length})</h2>
        <div className="ns-stack" style={{ marginTop: 14 }}>{nid.length ? nid.map((l) => <LearnerCard key={l.id} l={l} />) : <p className="ns-muted">अभी कोई नहीं।</p>}</div>
      </div>
      <div>
        <h2 className="ns-h2">ज्ञान-यात्रा में साधक ({rest.length})</h2>
        <div className="ns-stack" style={{ marginTop: 14 }}>{rest.map((l) => <LearnerCard key={l.id} l={l} />)}</div>
      </div>
    </section>
  );
}
