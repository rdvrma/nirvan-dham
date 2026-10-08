/* eslint-disable @typescript-eslint/no-require-imports */
// Offline publishing tool. Never exposes a billable TTS endpoint to readers.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const { VOICE, narrationText, splitSpeech, sourceHash } = require('./magazine-audio-utils.cjs');
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  module._compile(outputText, filename);
};
const { issue01 } = require('../src/data/nirvana-sutra/issue-01.ts');
const languageIndex = process.argv.indexOf('--language');
const english = languageIndex !== -1 && process.argv[languageIndex + 1] === 'en';
const issue = english ? require('../src/data/nirvana-sutra/localization.ts').issue01English : issue01;
const voice = english ? { ...VOICE, language_code: 'en-IN' } : VOICE;
const { flatEntries } = require('../src/data/nirvana-sutra/types.ts');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public', 'magazine-audio', 'narration', ...(english ? ['en'] : []));
const manifestPath = path.join(root, 'src', 'data', 'nirvana-sutra', english ? 'audio-manifest.en.json' : 'audio-manifest.json');
const cache = path.join(os.tmpdir(), 'nirvana-sutra-sarvam-audio');
fs.mkdirSync(output, { recursive: true }); fs.mkdirSync(cache, { recursive: true });
const envFileIndex = process.argv.indexOf('--env-file');
if (envFileIndex !== -1) {
  const env = fs.readFileSync(process.argv[envFileIndex + 1], 'utf8');
  const match = env.match(/^SARVAM_API_KEY\s*=\s*(.+)$/m);
  if (match) process.env.SARVAM_API_KEY = match[1].trim().replace(/^['"]|['"]$/g, '');
}
const key = process.env.SARVAM_API_KEY;
if (!key) throw new Error('Set SARVAM_API_KEY or pass --env-file with a local secret file.');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
async function speech(text, file) {
  if (fs.existsSync(file)) return;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'api-subscription-key': key },
      body: JSON.stringify({ ...voice, text }), signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) {
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000 * 2 ** attempt)); continue;
      }
      throw new Error(`Sarvam TTS HTTP ${res.status}; response omitted to protect credentials.`);
    }
    const data = await res.json();
    if (!data.audios?.[0]) throw new Error('Sarvam returned no audio.');
    const buffer = Buffer.from(data.audios[0], 'base64');
    if (buffer.length < 1000) throw new Error('Sarvam returned an empty audio file.');
    fs.writeFileSync(file, buffer); return;
  }
}
(async () => {
  for (const entry of flatEntries(issue)) {
    const hash = sourceHash(entry, voice);
    const filename = `${entry.id}-${hash.slice(0, 10)}.mp3`;
    const destination = path.join(output, filename);
    if (!fs.existsSync(destination)) {
      const chunks = splitSpeech(narrationText(entry));
      const files = chunks.map((_, i) => path.join(cache, `${hash}-${i}.mp3`));
      for (let i = 0; i < chunks.length; i++) {
        await speech(chunks[i], files[i]);
        console.log(`${entry.id}: part ${i + 1}/${chunks.length}`);
      }
      const list = path.join(cache, `${hash}.txt`);
      fs.writeFileSync(list, files.map(file => `file '${file.replace(/\\/g, '/')}'`).join('\n'));
      // One continuous, small mono MP3, with consistent seek timestamps.
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', '48k', destination]);
    }
    const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', destination], { encoding: 'utf8' }).trim());
    manifest[entry.id] = { src: `/magazine-audio/narration/${english ? 'en/' : ''}${filename}`, title: entry.title, seconds, sourceHash: hash, voice: voice.speaker, model: voice.model };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`Saved ${entry.id}: ${Math.round(seconds)}s`);
  }
  console.log(`Complete: ${Object.keys(manifest).length} narrated chapters.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
