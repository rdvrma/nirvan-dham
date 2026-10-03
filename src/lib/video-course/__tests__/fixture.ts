// Test helper: reads the committed fixture (public/course-fixture/ch1) from disk.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'public', 'course-fixture', 'ch1');
export const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8'));
export const readText = (rel: string) => fs.readFileSync(path.join(dir, rel), 'utf8');
export const manifestJson = () => readJson('manifest.json');
export const wordsHi = () => readJson('captions/hi.words.json');
export const wordsEn = () => readJson('captions/en.words.json');
export const vttHi = () => readText('captions/hi.vtt');
