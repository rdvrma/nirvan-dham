import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const base = process.argv[2];
if (!base) throw new Error('Usage: node scripts/build-question-thumbnails.mjs <asset-directory>');
const source = JSON.parse(await fs.readFile(new URL('../src/course/nirvan-sutra/content/source.json', import.meta.url), 'utf8'));

const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function linesFor(question) {
  const words = question.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > 36) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

for (const name of (await fs.readdir(base)).sort()) {
  const folder = path.join(base, name);
  const metadataPath = path.join(folder, 'youtube.json');
  try {
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    const [chapter, number] = name.match(/t(\d+)-q(\d+)/).slice(1).map(Number);
    const question = source.stages.find((stage) => stage.n === chapter)?.questions.find((item) => item.n === number)?.text.hi ?? metadata.title.split(' | ')[0];
    const lines = linesFor(question);
    const fontSize = lines.length > 3 ? 52 : lines.length > 2 ? 60 : 68;
    const top = lines.length > 3 ? 292 : lines.length > 2 ? 310 : 342;
    const tspans = lines.map((line, index) => `<tspan x="86" y="${top + index * (fontSize + 18)}">${escapeXml(line)}</tspan>`).join('');
    const overlay = Buffer.from(`<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07110c" stop-opacity=".95"/><stop offset="1" stop-color="#102218" stop-opacity=".78"/></linearGradient></defs>
      <rect width="1280" height="720" fill="url(#shade)"/>
      <rect x="50" y="48" width="1180" height="624" rx="18" fill="none" stroke="#d6af48" stroke-opacity=".55" stroke-width="2"/>
      <rect x="86" y="204" width="146" height="4" fill="#d6af48"/>
      <text x="86" y="174" font-family="Nirmala UI, Mangal, sans-serif" font-size="28" fill="#e2bd5d">ज्ञानमार्ग ${String(chapter).padStart(2, '0')} · प्रश्न ${number}</text>
      <text font-family="Nirmala UI, Mangal, sans-serif" font-weight="bold" font-size="${fontSize}" fill="#fff8e8">${tspans}</text>
      <text x="86" y="626" font-family="Nirmala UI, Mangal, sans-serif" font-size="24" fill="#d6af48">निर्वाण सूत्र · प्रश्नोत्तर</text>
    </svg>`);
    const background = await sharp(path.join(folder, 'thumbnail.jpg')).resize(1280, 720).blur(28).toBuffer();
    await sharp(background).composite([{ input: overlay }]).jpeg({ quality: 93 }).toFile(path.join(folder, 'question-thumbnail.jpg'));
    console.log(name, lines.length, question);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
