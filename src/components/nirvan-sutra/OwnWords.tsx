'use client';
// Questions a seeker answers in their own words. There is no right or wrong: writing an honest answer to each question is the whole requirement.
// The answers are saved in the seeker's progress and reach a guide; nothing here grades them.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { act, fmt } from './api';
import { useCourse } from './CourseShell';
import { Tick } from './VideoPlayer';
import { PROGRAM } from '@/course/nirvan-sutra/structure';

const OWN_WORDS_MIN = PROGRAM.writtenMinChars;
export const ownWordsReady = (answers: string[], n: number) => answers.length === n && answers.every((a) => [...a.trim()].length >= OWN_WORDS_MIN);

/** The question fields themselves (used by the stage check and inside the checkpoints / final). */
export function OwnWordsFields({ id, prompts, value, onChange, disabled = false }: { id: string; prompts: string[]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const { ui } = useCourse();
  return (
    <div className="ns-stack">
      <p className="ns-muted">{ui.writtenIntro}</p>
      {prompts.map((q, i) => {
        const len = [...(value[i] ?? '').trim()].length;
        return (
          <div key={i} className="ns-q ns-own">
            <label className="ns-q-prompt" htmlFor={`${id}-${i}`} style={{ display: 'flex', gap: 12 }}>
              <span className="ns-qnum" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span>{q}</span>
            </label>
            <textarea id={`${id}-${i}`} className="ns-textarea" value={value[i] ?? ''} disabled={disabled} maxLength={4000} placeholder={ui.writtenPlaceholder}
              onChange={(e) => { const next = [...value]; next[i] = e.target.value; onChange(next); }} />
            <div className="ns-own-meta" data-ok={len >= OWN_WORDS_MIN}>{len >= OWN_WORDS_MIN ? <Tick /> : fmt(ui.writtenMin, { n: OWN_WORDS_MIN })}</div>
          </div>
        );
      })}
    </div>
  );
}

/** A stage's understanding check: three questions in the seeker's own words, sent together. */
export default function StageOwnWords({ stage, prompts, initial }: { stage: string; prompts: string[]; initial: string[] | null }) {
  const { ui, toast } = useCourse();
  const router = useRouter();
  const [value, setValue] = useState<string[]>(initial ?? prompts.map(() => ''));
  const [sent, setSent] = useState(!!initial);
  const [busy, setBusy] = useState(false);
  const ready = ownWordsReady(value, prompts.length);
  const send = async () => {
    setBusy(true);
    try { await act('written', { stage, answers: value.map((a) => a.trim()) }); setSent(true); toast(ui.writtenSent); router.refresh(); }
    catch (e) { toast((e as Error).message); }
    finally { setBusy(false); }
  };
  return (
    <div className="ns-stack">
      <OwnWordsFields id={`own-${stage}`} prompts={prompts} value={value} onChange={setValue} disabled={sent} />
      <div className="ns-row">
        {sent
          ? <><span className="ns-chip ns-chip-sage"><Tick /> {ui.writtenSent}</span><button className="ns-btn ns-btn-quiet" onClick={() => setSent(false)}>{ui.writtenEdit}</button></>
          : <><button className="ns-btn" onClick={send} disabled={!ready || busy}>{ui.writtenSubmit}</button>{!ready && <span className="ns-small ns-muted">{ui.writtenNeed}</span>}</>}
      </div>
    </div>
  );
}
