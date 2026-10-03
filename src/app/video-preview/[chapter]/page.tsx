// Public preview of a video lesson, WITHOUT sign-in: for preview deployments and the e2e tests. It exists only when BOTH the video-course flag
// (NEXT_PUBLIC_VIDEO_COURSE) and VIDEO_COURSE_PUBLIC_PREVIEW are on; otherwise it is a 404, so production (flag off, or flag on without the preview variable) never serves it.
// Progress and answers stay on the device (localStorage); nothing is sent anywhere.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLessonConfig, isPublicPreviewEnabled, isVideoCourseEnabled } from '@/lib/video-course/config';
import VideoLessonEntry from '@/components/video-course/VideoLessonEntry';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Video lesson preview | Nirvan Dham', robots: { index: false, follow: false } };

interface PageProps {
  params: Promise<{ chapter: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export default async function VideoPreviewPage({ params, searchParams }: PageProps) {
  if (!isVideoCourseEnabled() || !isPublicPreviewEnabled()) notFound();
  const { chapter } = await params;
  const num = parseInt(chapter, 10);
  if (!Number.isInteger(num) || !getLessonConfig(num)) notFound();
  const lang = (await searchParams)?.lang;
  return <VideoLessonEntry chapter={num} courseLang={lang === 'en' || lang === 'hl' ? lang : 'hi'} mode="preview" backHref="/course" />;
}
