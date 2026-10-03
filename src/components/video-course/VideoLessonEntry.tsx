'use client';

import { useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getLessonConfig } from '@/lib/video-course/config';
import { LocalStorageProgressAdapter, SupabaseProgressAdapter } from '@/lib/video-course/progress';
import VideoLesson from './VideoLesson';

/**
 * Client entry of a video lesson. mode "course": the learner is signed in, progress and answers go to Supabase through the site's existing client and session (they fall back to
 * this device if the tables do not exist yet). mode "preview": no sign-in, device storage only.
 */
export default function VideoLessonEntry({ chapter, courseLang, mode, backHref, readHref, poster }: { chapter: number; courseLang: string; mode: 'course' | 'preview'; backHref: string; readHref?: string; poster?: string }) {
  const lesson = getLessonConfig(chapter);
  const adapter = useMemo(() => (mode === 'course' ? new SupabaseProgressAdapter(createClient()) : new LocalStorageProgressAdapter()), [mode]);
  if (!lesson) return null;
  return <VideoLesson lesson={lesson} courseLang={courseLang} adapter={adapter} backHref={backHref} readHref={readHref} poster={poster} />;
}
