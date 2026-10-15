// Upload and verify only dubbed tracks for published Nirvan Sutra films.
// Usage: node scripts/upload-course-audio.mjs [--dry-run]
// Reads Runpod credentials from .env.local or the process environment.
import fs from 'node:fs';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import nextEnv from '@next/env';
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

nextEnv.loadEnvConfig(process.cwd());
const dryRun = process.argv.includes('--dry-run');
const root = process.cwd();
const source = JSON.parse(fs.readFileSync(path.join(root, 'src/course/nirvan-sutra/content/source.json'), 'utf8'));
const videos = JSON.parse(fs.readFileSync(path.join(root, 'src/course/nirvan-sutra/content/videos.json'), 'utf8'));
const locales = ['en', 'bn', 'ta', 'te', 'gu', 'kn', 'ml', 'mr', 'pa', 'or'];
const entries = [];
for (const [lessonId, video] of Object.entries(videos.lessons)) {
  if (video.publishStatus !== 'published' || video.videoProvider !== 'youtube') continue;
  const filmId = source.lessons[lessonId]?.filmId;
  if (!filmId || !/^gm-t\d{2}-(?:main|q\d{2})$/.test(filmId)) throw new Error(`Unrecognized film ${lessonId}`);
  for (const locale of locales) {
    const file = path.join(root, 'public', 'local-course-audio', filmId, `${locale}.m4a`);
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size < 1024) throw new Error(`Invalid ${filmId}/${locale}`);
    entries.push({ file, size: stat.size, key: `nirvan-sutra/course-audio/v1/${filmId}/${locale}.m4a` });
  }
}
console.log(`${entries.length} audio tracks, ${(entries.reduce((n, x) => n + x.size, 0) / 1e9).toFixed(2)} GB`);
if (dryRun) process.exit(0);

const accessKeyId = process.env.RUNPOD_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.RUNPOD_S3_SECRET_ACCESS_KEY;
const Bucket = process.env.RUNPOD_S3_VOLUME_ID || 'pmkv7j3v41';
if (!accessKeyId || !secretAccessKey) throw new Error('Runpod S3 credentials are missing');
const s3 = new S3Client({
  endpoint: process.env.RUNPOD_S3_ENDPOINT || 'https://s3api-eu-ro-1.runpod.io',
  region: process.env.RUNPOD_S3_REGION || 'eu-ro-1',
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
  maxAttempts: 4,
});
let done = 0, uploaded = 0;
async function one(entry) {
  const args = { Bucket, Key: entry.key };
  let remote;
  try { remote = await s3.send(new HeadObjectCommand(args)); }
  catch (error) {
    if (error?.$metadata?.httpStatusCode !== 404 && error?.name !== 'NotFound' && error?.name !== 'NoSuchKey') throw error;
  }
  if (remote?.ContentLength !== entry.size) {
    await s3.send(new PutObjectCommand({ ...args, Body: createReadStream(entry.file), ContentLength: entry.size, ContentType: 'audio/mp4', CacheControl: 'private, max-age=21600' }));
    uploaded++;
  }
  const verified = await s3.send(new HeadObjectCommand(args));
  if (verified.ContentLength !== entry.size) throw new Error(`Size mismatch: ${entry.key}`);
  done++;
  if (done % 10 === 0 || done === entries.length) console.log(`Verified ${done}/${entries.length}; uploaded ${uploaded}`);
}
const pending = [...entries];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (pending.length) {
    const entry = pending.shift();
    if (entry) await one(entry);
  }
}));
console.log('All course audio verified on Runpod. Set RUNPOD_COURSE_AUDIO_READY=1 on Vercel.');
