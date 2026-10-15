import Link from 'next/link';
import { redirect } from 'next/navigation';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import { programView } from '@/course/nirvan-sutra/server/content';
import * as E from '@/course/nirvan-sutra/engine';
import { PROGRAM } from '@/course/nirvan-sutra/structure';
import NididhyasanaBoard, { type WeekView } from '@/components/nirvan-sutra/Nididhyasana';
import { Visit } from '@/components/nirvan-sutra/Bits';
import { guideStore } from '@/course/nirvan-sutra/server/guide';

// Phase II, निदिध्यासन संग. One guided session per week, seven days apart from the start; the live link, recording and session note come from
// the guide's desk (/nirvan-sutra/yatra/guide), and so does the guide's note to this learner for each week.
export default async function NididhyasanaPage() {
  const { progress: p, locale, t } = await enrolledContext();
  if (!E.nididhyasanaUnlocked(p)) redirect(`${BASE}/dashboard`);
  if (!p.nididhyasana.startedAt) redirect(`${BASE}/phase-one-complete`);
  const prog = programView(locale);
  const current = E.nididhyasanaWeek(p)!;
  const start = new Date(p.nididhyasana.startedAt);
  const g = await guideStore();
  const [gw, notes] = await Promise.all([g.weeks(), g.notesFor(p.learnerId)]);
  const dateFmt = new Intl.DateTimeFormat(locale === 'or' ? 'or-IN' : `${locale}-IN`, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  const weeks: WeekView[] = prog.nididhyasana.weeks.map((w) => {
    const d = new Date(start.getTime() + (w.n - 1) * 7 * 86400000 + 5 * 86400000);
    d.setHours(19, 0, 0, 0);
    const pw = p.nididhyasana.weeks[w.n];
    return {
      ...w, sessionDate: dateFmt.format(d), sessionStatus: w.n < current ? 'past' : w.n === current ? 'now' : 'upcoming',
      liveSessionUrl: gw[w.n]?.liveSessionUrl ?? null, recordingUrl: gw[w.n]?.recordingUrl ?? null,
      teacherNote: [notes[w.n], gw[w.n]?.sessionNote].filter(Boolean).join(' · ') || null,
      attended: !!pw?.attended, reflection: pw?.reflection ?? '', doubts: pw?.doubts ?? [],
    };
  });
  const part = E.participation(p);
  const complete = E.nididhyasanaComplete(p);
  return (
    <section>
      <Visit kind="nididhyasana" id={`week-${Math.min(12, current)}`} />
      <header className="ns-opening ns-narrow">
        <div className="ns-eyebrow">{t('phase2')}</div>
        <h1 className="ns-h1" style={{ marginTop: 10 }}>{t('phase2Sub')}</h1>
        <p className="ns-lead" style={{ marginTop: 12 }}>{t('nidTransitionTitle')}</p>
        {prog.fallback.nididhyasana && <p className="ns-notice" style={{ marginTop: 14 }}>{t('notInYourLanguage', { lang: 'English' })}</p>}
      </header>
      {complete && (
        <div className="ns-panel ns-panel-glow" style={{ marginBottom: 28 }}>
          <div className="ns-eyebrow">{t('nidComplete')}</div>
          <p className="ns-lead" style={{ marginTop: 8 }}>{t('finalReflectionIntro')}</p>
          <Link className="ns-btn" style={{ marginTop: 14 }} href={`${BASE}/reflection`}>{t('finalReflectionTitle')}</Link>
        </div>
      )}
      <NididhyasanaBoard weeks={weeks} current={current} participation={{ attended: part.attended, reflections: part.reflections, needAttended: PROGRAM.nididhyasana.minWeeksAttended, needReflections: PROGRAM.nididhyasana.minWeeklyReflections }} />
    </section>
  );
}
