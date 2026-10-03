'use client';

import Link from 'next/link';
import { LESSONS, enabledLanguagesFor, trackLanguageFor } from '@/lib/video-course/config';

const GOLD = '#d4a843';

/** Shown on /course ONLY when the video-course flag is on: a calm door to the chapters that have a video lesson. The reading flow below it is untouched. */
export default function VideoLessonsEntry({ savedLang }: { savedLang: string | null }) {
  const chapters = Object.values(LESSONS);
  if (!chapters.length) return null;
  const hindi = (savedLang ?? 'hi') !== 'en';
  return (
    <div data-testid="video-lessons-entry" style={{ width: '100%', maxWidth: '640px', marginTop: '1.75rem' }}>
      <p style={{ fontFamily: 'var(--font-hind)', fontSize: '0.8rem', color: 'rgba(245,237,216,0.52)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
        {hindi ? 'नया · वीडियो पाठ' : 'New · Video lessons'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {chapters.map((c) => {
          const lang = savedLang ?? trackLanguageFor('hi', enabledLanguagesFor(c));
          return (
            <Link
              key={c.chapter}
              href={`/course/${lang}/${c.chapter}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem', border: '1px solid rgba(212,168,67,0.22)', borderRadius: '14px', background: 'rgba(12,24,14,0.9)', color: 'rgba(245,237,216,1)', textDecoration: 'none', minHeight: '56px' }}
            >
              <span style={{ fontFamily: 'var(--font-hind)', fontSize: '1rem' }}>{hindi ? `अध्याय ${c.chapter} · स्वयं की खोज` : `Chapter ${c.chapter} · The Discovery of Self`}</span>
              <span style={{ color: GOLD, fontFamily: 'var(--font-inter)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{hindi ? 'देखें →' : 'Watch →'}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
