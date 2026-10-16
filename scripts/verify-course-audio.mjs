// Checks the Runpod object and byte-range response used by the authenticated
// course audio route. Does not print credentials or signed URLs.
import nextEnv from '@next/env';
import { GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';

nextEnv.loadEnvConfig(process.cwd());
const { RUNPOD_S3_ACCESS_KEY_ID: accessKeyId, RUNPOD_S3_SECRET_ACCESS_KEY: secretAccessKey,
  RUNPOD_S3_VOLUME_ID: Bucket } = process.env;
if (!accessKeyId || !secretAccessKey || !Bucket) throw new Error('Runpod credentials missing');
const s3 = new S3Client({ endpoint: process.env.RUNPOD_S3_ENDPOINT || 'https://s3api-eu-ro-1.runpod.io',
  region: process.env.RUNPOD_S3_REGION || 'eu-ro-1', forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey } });
const film = process.argv[2] || 'gm-t01-main';
const locale = process.argv[3] || 'en';
if (!/^gm-t\d{2}-(?:main|q\d{2})$/.test(film) || !/^[a-z]{2}$/.test(locale)) throw new Error('Invalid film or locale');
const Key = `nirvan-sutra/course-audio/v1/${film}/${locale}.m4a`;
const head = await s3.send(new HeadObjectCommand({ Bucket, Key }));
const range = await s3.send(new GetObjectCommand({ Bucket, Key, Range: 'bytes=0-1023' }));
const bytes = await range.Body?.transformToByteArray();
if (range.ContentRange !== `bytes 0-1023/${head.ContentLength}` || bytes?.byteLength !== 1024) {
  throw new Error(`Media range failed: ${range.ContentRange}, ${bytes?.byteLength} bytes`);
}
console.log(`Authenticated object: ${head.ContentLength} bytes; media range: ${range.ContentRange}, ${bytes.byteLength} bytes`);
