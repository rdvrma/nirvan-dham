import { isLocale } from '@/course/nirvan-sutra/locales';
import { source, videoAsset } from '@/course/nirvan-sutra/server/content';
import { currentAccount } from '@/course/nirvan-sutra/server/session';
import { courseAudioObject, runpodAudioReady } from '@/course/nirvan-sutra/server/runpod-audio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ filmId: string; locale: string }> }) {
  const { filmId, locale } = await params;
  if (!isLocale(locale) || locale === 'hi') return new Response('Not found', { status: 404 });
  const lesson = Object.values(source().lessons).find((item) => item.filmId === filmId);
  if (!lesson || videoAsset(lesson.id).publishStatus !== 'published') return new Response('Not found', { status: 404 });
  if (!await currentAccount()) return new Response('Sign in required', { status: 401 });
  if (!runpodAudioReady()) return new Response('Audio unavailable', { status: 503 });
  try {
    const object = await courseAudioObject(filmId, locale, request.headers.get('range'));
    if (!object.Body) throw new Error('Audio body missing');
    const headers = new Headers({
      'Content-Type': 'audio/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    });
    if (object.ContentLength !== undefined) headers.set('Content-Length', String(object.ContentLength));
    if (object.ContentRange) headers.set('Content-Range', object.ContentRange);
    return new Response(object.Body.transformToWebStream(), { status: object.ContentRange ? 206 : 200, headers });
  } catch (error) {
    if (error && typeof error === 'object' && '$metadata' in error && (error.$metadata as {httpStatusCode?: number})?.httpStatusCode === 416) {
      return new Response('Requested range unavailable', { status: 416 });
    }
    return new Response('Audio unavailable', { status: 503 });
  }
}
