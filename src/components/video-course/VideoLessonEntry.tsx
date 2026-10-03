'use client';

import { useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getLessonConfig, type TrackLanguage } from '@/lib/video-course/config';
import { LocalStorageProgressAdapter, SupabaseProgressAdapter } from '@/lib/video-course/progress';
import VideoLesson from './VideoLesson';

/**
 * Client entry of a video lesson. mode "course": the learner is signed in, progress and answers go to Supabase through the site's existing client and session (they fall back to
 * this device if the tables do not exist yet). mode "preview": no sign-in, device storage only.
 */
export default function VideoLessonEntry({ chapter, courseLang, mode, backHref, readHref, poster, youtubeIds }: { chapter: number; courseLang: string; mode: 'course' | 'preview'; backHref: string; readHref?: string; poster?: string; youtubeIds?: Partial<Record<TrackLanguage, string | null>> }) {
  const base = getLessonConfig(chapter);
  // `youtubeIds` is only ever passed by the public preview route (to try a real unlisted upload before the ids are put into the config)
  const lesson = useMemo(() => (base && youtubeIds ? { ...base, youtubeIds: { ...base.youtubeIds, ...youtubeIds } } : base), [base, youtubeIds?.hi, youtubeIds?.en]); // eslint-disable-line react-hooks/exhaustive-deps
  const adapter = useMemo(() => (mode === 'course' ? new SupabaseProgressAdapter(createClient()) : new LocalStorageProgressAdapter()), [mode]);
  if (!lesson) return null;
  return <VideoLesson lesson={lesson} courseLang={courseLang} adapter={adapter} backHref={backHref} readHref={readHref} poster={poster} />;
}
