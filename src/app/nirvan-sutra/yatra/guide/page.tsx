import { notFound } from 'next/navigation';
import { requireSignedIn, BASE } from '@/course/nirvan-sutra/server/context';
import { isGuide } from '@/course/nirvan-sutra/server/guide';
import { guideView } from '@/course/nirvan-sutra/server/guide-actions';
import { programView } from '@/course/nirvan-sutra/server/content';
import GuidePanel from '@/components/nirvan-sutra/GuidePanel';

export const metadata = { robots: { index: false, follow: false } };

// The guide's desk for Phase II (निदिध्यासन संग): the 12 weekly sessions, and each learner's attendance, doubts and the guide's notes.
export default async function GuidePage() {
  await requireSignedIn(`${BASE}/guide`);
  if (!(await isGuide())) notFound();
  const { weeks, learners } = await guideView();
  const themes = programView('hi').nididhyasana.weeks.map((w) => ({ n: w.n, theme: w.theme }));
  return <GuidePanel weeks={Array.from({ length: 12 }, (_, i) => weeks[i + 1] ?? { week: i + 1, liveSessionUrl: null, recordingUrl: null, sessionNote: null })} themes={themes} learners={learners} />;
}
