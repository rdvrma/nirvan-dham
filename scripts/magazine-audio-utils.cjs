/* eslint-disable @typescript-eslint/no-require-imports */
const { createHash } = require('node:crypto');
const VOICE = { model: 'bulbul:v3', speaker: 'shubh', language_code: 'hi-IN', pace: .95, speech_sample_rate: 24000, output_audio_codec: 'mp3' };
function narrationText(entry) {
  return `${entry.title}${/[\u0900-\u097f]/.test(entry.title) ? '।' : '.'}\n\n${entry.body}`;
}
function splitSpeech(text, limit = 2300) {
  const chunks = [];
  let rest = text.trim();
  while (rest.length > limit) {
    const sample = rest.slice(0, limit);
    let cut = sample.lastIndexOf('\n\n');
    if (cut < limit / 2) cut = Math.max(sample.lastIndexOf('।'), sample.lastIndexOf('?'), sample.lastIndexOf('!')) + 1;
    if (cut < limit / 2) cut = sample.lastIndexOf(' ');
    if (cut <= 0) cut = limit;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}
function sourceHash(entry, voice = VOICE) {
  return createHash('sha256').update(JSON.stringify(voice) + narrationText(entry)).digest('hex');
}
module.exports = { VOICE, narrationText, splitSpeech, sourceHash };
