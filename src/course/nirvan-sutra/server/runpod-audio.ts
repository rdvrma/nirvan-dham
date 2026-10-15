import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const COURSE_AUDIO_PREFIX = 'nirvan-sutra/course-audio/v1';

export function runpodAudioReady() {
  return process.env.RUNPOD_COURSE_AUDIO_READY === '1' && !!(
    process.env.RUNPOD_S3_ACCESS_KEY_ID &&
    process.env.RUNPOD_S3_SECRET_ACCESS_KEY &&
    process.env.RUNPOD_S3_VOLUME_ID
  );
}

export function courseAudioKey(filmId: string, locale: string) {
  if (!/^gm-t\d{2}-(?:main|q\d{2})$/.test(filmId) || !/^[a-z]{2}$/.test(locale)) {
    throw new Error('Invalid course audio key');
  }
  return `${COURSE_AUDIO_PREFIX}/${filmId}/${locale}.m4a`;
}

export function runpodS3Client() {
  const accessKeyId = process.env.RUNPOD_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.RUNPOD_S3_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) throw new Error('Runpod S3 credentials are missing');
  return new S3Client({
    endpoint: process.env.RUNPOD_S3_ENDPOINT || 'https://s3api-eu-ro-1.runpod.io',
    region: process.env.RUNPOD_S3_REGION || 'eu-ro-1',
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/** Runpod's S3 API needs an Authorization header and rejects presigned URLs.
 * Keep that header on the server and stream only the requested byte range. */
export async function courseAudioObject(filmId: string, locale: string, range?: string | null) {
  if (!runpodAudioReady()) throw new Error('Course audio is not ready');
  return runpodS3Client().send(new GetObjectCommand({
    Bucket: process.env.RUNPOD_S3_VOLUME_ID!,
    Key: courseAudioKey(filmId, locale),
    Range: range && /^bytes=\d*-\d*$/.test(range) ? range : undefined,
  }));
}
