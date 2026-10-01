/**
 * Nirvan Dham — Sarvam AI Audiobook Generator
 * 
 * Uses Sarvam AI TTS (bulbul:v3) to synthesize high-quality audiobooks
 * for all Nirvan Dham books in Hindi and English.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || 'sk_5daqnj3r_A5kDtSrHDGLh8E2TyZxBOXE7';
const BOOKS_DIR = path.join(__dirname, '..', 'src', 'content', 'books');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'library', 'audiobooks');

// Rate limiting delay in ms
const DELAY_BETWEEN_CALLS = 500;

// All 18 books in Nirvan Dham Digital Library
const LIBRARY_MANIFEST = [
  // ── Hindi Books (9) ──
  {
    slug: 'main-kaun-hoon',
    file: 'main-kaun-hoon.json',
    lang: 'hi',
    speaker: 'shubh',
    titleHindi: 'मैं कौन हूँ',
    titleEnglish: 'Who Am I',
    subtitleHindi: 'साधक ही भ्रम है',
    subtitleEnglish: 'The Seeker Is the Illusion',
    moodHindi: 'खोज से विश्राम तक',
    moodEnglish: 'From seeking to stillness',
    accent: '#d4a843',
  },
  {
    slug: 'maya-aur-man',
    file: 'maya-aur-man.json',
    lang: 'hi',
    speaker: 'shubh',
    titleHindi: 'माया और मन',
    titleEnglish: 'Maya and Mind',
    subtitleHindi: 'विचार, भ्रम और जागृति की पहचान',
    subtitleEnglish: 'Thought, illusion and the recognition of awakening',
    moodHindi: 'मन को देखने की कला',
    moodEnglish: 'Seeing the movement of mind',
    accent: '#b9c76a',
  },
  {
    slug: 'ishwar-kaun-hai',
    file: 'ishwar-kaun-hai.json',
    lang: 'hi',
    speaker: 'shubh',
    titleHindi: 'ईश्वर कौन है?',
    titleEnglish: 'Who Is God?',
    subtitleHindi: 'स्वरूप से अरूप तक',
    subtitleEnglish: 'From Form to Formless',
    moodHindi: 'भक्ति से अद्वैत तक',
    moodEnglish: 'From devotion to non-duality',
    accent: '#e29d52',
  },
  {
    slug: 'advaita-ka-bodh',
    file: 'advaita-ka-bodh.json',
    lang: 'hi',
    speaker: 'shubh',
    titleHindi: 'अद्वैत का बोध',
    titleEnglish: 'The Realization of Advaita',
    subtitleHindi: 'शास्त्र से सत्य तक',
    subtitleEnglish: 'From Scripture to Truth',
    moodHindi: 'प्रत्यक्ष दर्शन',
    moodEnglish: 'Direct Seeing',
    accent: '#d4af37',
  },
  {
    slug: 'shiv-aur-shakti',
    file: 'shiv-aur-shakti.json',
    lang: 'hi',
    speaker: 'shubh',
    titleHindi: 'शिव और शक्ति',
    titleEnglish: 'Shiva and Shakti',
    subtitleHindi: 'जब दो नहीं, एक है',
    subtitleEnglish: 'When Two Are Not Two, but One',
    moodHindi: 'चेतना और ऊर्जा का मिलन',
    moodEnglish: 'Union of awareness and energy',
    accent: '#7eb6d9',
  },
  {
    slug: 'yog-swayam-ki-or',
    file: 'yog-swayam-ki-or.json',
    lang: 'hi',
    speaker: 'shubh',
    titleHindi: 'योग: स्वयं की ओर',
    titleEnglish: 'Yoga: Toward the Self',
    subtitleHindi: 'शास्त्रों के आलोक में',
    subtitleEnglish: 'In the Light of Scriptures',
    moodHindi: 'अभ्यास से आत्म-विश्राम',
    moodEnglish: 'Practice to self-rest',
    accent: '#dca657',
  },
  {
    slug: 'tantra-margon-ka-sangam',
    file: 'tantra-margon-ka-sangam.json',
    lang: 'hi',
    speaker: 'shubh',
    titleHindi: 'तंत्र: मार्गों का संगम',
    titleEnglish: 'Tantra: Confluence of Paths',
    subtitleHindi: 'आगम से अद्वैत तक',
    subtitleEnglish: 'From Agama to Advaita',
    moodHindi: 'समग्र स्वीकृति',
    moodEnglish: 'Total acceptance',
    accent: '#a57cd6',
  },
  {
    slug: 'maya-ke-maze',
    file: 'maya-ke-maze.json',
    lang: 'hi',
    speaker: 'shubh',
    titleHindi: 'माया के मज़े',
    titleEnglish: 'The Joys of Maya',
    subtitleHindi: 'संसार को साक्षी भाव से देखना',
    subtitleEnglish: 'Witnessing the cosmic play',
    moodHindi: 'सहज हास्य और वैराग्य',
    moodEnglish: 'Gentle humor and dispassion',
    accent: '#c9a26d',
  },
  {
    slug: 'sukshm-sansar',
    file: 'sukshm-sansar.json',
    lang: 'hi',
    speaker: 'shubh',
    titleHindi: 'सूक्ष्म संसार',
    titleEnglish: 'The Subtle Worlds',
    subtitleHindi: 'दृश्य के पार, द्रष्टा की ओर',
    subtitleEnglish: 'Beyond the Seen, Toward the Seer',
    moodHindi: 'गहन विवेक और दर्शन',
    moodEnglish: 'Deep discernment',
    accent: '#dfb76c',
  },

  // ── English Books (9) ──
  {
    slug: 'the-seeker-is-the-illusion-en',
    file: 'the-seeker-is-the-illusion.json',
    lang: 'en',
    speaker: 'shubh',
    titleHindi: 'The Seeker Is the Illusion',
    titleEnglish: 'The Seeker Is the Illusion',
    subtitleHindi: 'A quiet return from seeking to seeing',
    subtitleEnglish: 'A quiet return from seeking to seeing',
    moodHindi: 'Self-inquiry in listening',
    moodEnglish: 'Self-inquiry in listening',
    accent: '#d4a843',
  },
  {
    slug: 'maya-and-mind-en',
    file: 'maya-and-mind.json',
    lang: 'en',
    speaker: 'shubh',
    titleHindi: 'Maya and Mind',
    titleEnglish: 'Maya and Mind',
    subtitleHindi: 'Thought, illusion and the recognition of awakening',
    subtitleEnglish: 'Thought, illusion and the recognition of awakening',
    moodHindi: 'Seeing the movement of mind',
    moodEnglish: 'Seeing the movement of mind',
    accent: '#b9c76a',
  },
  {
    slug: 'who-is-god-en',
    file: 'who-is-god.json',
    lang: 'en',
    speaker: 'shubh',
    titleHindi: 'Who Is God?',
    titleEnglish: 'Who Is God?',
    subtitleHindi: 'From Form to Formless',
    subtitleEnglish: 'From Form to Formless',
    moodHindi: 'Contemplation on Divinity',
    moodEnglish: 'Contemplation on Divinity',
    accent: '#e29d52',
  },
  {
    slug: 'realization-of-advaita-en',
    file: 'realization-of-advaita.json',
    lang: 'en',
    speaker: 'shubh',
    titleHindi: 'The Realization of Advaita',
    titleEnglish: 'The Realization of Advaita',
    subtitleHindi: 'From Scripture to Truth',
    subtitleEnglish: 'From Scripture to Truth',
    moodHindi: 'Direct inquiry',
    moodEnglish: 'Direct inquiry',
    accent: '#d4af37',
  },
  {
    slug: 'shiva-and-shakti-en',
    file: 'shiva-and-shakti.json',
    lang: 'en',
    speaker: 'shubh',
    titleHindi: 'Shiva and Shakti',
    titleEnglish: 'Shiva and Shakti',
    subtitleHindi: 'When Two Are One',
    subtitleEnglish: 'When Two Are One',
    moodHindi: 'Oneness of consciousness and creation',
    moodEnglish: 'Oneness of consciousness and creation',
    accent: '#7eb6d9',
  },
  {
    slug: 'yoga-toward-the-self-en',
    file: 'yoga-toward-the-self.json',
    lang: 'en',
    speaker: 'shubh',
    titleHindi: 'Yoga: Toward the Self',
    titleEnglish: 'Yoga: Toward the Self',
    subtitleHindi: 'In the Light of the Scriptures',
    subtitleEnglish: 'In the Light of the Scriptures',
    moodHindi: 'From practice to presence',
    moodEnglish: 'From practice to presence',
    accent: '#dca657',
  },
  {
    slug: 'tantra-confluence-of-paths-en',
    file: 'tantra-confluence-of-paths.json',
    lang: 'en',
    speaker: 'shubh',
    titleHindi: 'Tantra: Confluence of Paths',
    titleEnglish: 'Tantra: Confluence of Paths',
    subtitleHindi: 'From Agama to Advaita',
    subtitleEnglish: 'From Agama to Advaita',
    moodHindi: 'Integration and surrender',
    moodEnglish: 'Integration and surrender',
    accent: '#a57cd6',
  },
  {
    slug: 'the-joys-of-maya-en',
    file: 'the-joys-of-maya.json',
    lang: 'en',
    speaker: 'shubh',
    titleHindi: 'The Joys of Maya',
    titleEnglish: 'The Joys of Maya',
    subtitleHindi: 'The Play of Appearance',
    subtitleEnglish: 'The Play of Appearance',
    moodHindi: 'Witnessing with ease',
    moodEnglish: 'Witnessing with ease',
    accent: '#c9a26d',
  },
  {
    slug: 'the-subtle-worlds-en',
    file: 'the-subtle-worlds.json',
    lang: 'en',
    speaker: 'shubh',
    titleHindi: 'The Subtle Worlds',
    titleEnglish: 'The Subtle Worlds',
    subtitleHindi: 'Beyond the Seen, Toward the Seer',
    subtitleEnglish: 'Beyond the Seen, Toward the Seer',
    moodHindi: 'Discernment and clarity',
    moodEnglish: 'Discernment and clarity',
    accent: '#dfb76c',
  },
];

// Helper: Sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Clean text for TTS
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/[*#_~`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper: Split text into <= 450 char chunks for Sarvam
function splitIntoChunks(text, maxChars = 450) {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  // Split on sentence ends
  const rawSentences = cleaned.split(/([।\.\?!;\n]+)/).filter(Boolean);
  const sentences = [];
  for (let i = 0; i < rawSentences.length; i += 2) {
    const s = (rawSentences[i] + (rawSentences[i + 1] || '')).trim();
    if (s) sentences.push(s);
  }

  const chunks = [];
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxChars) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length > maxChars) {
        // Fallback split on words/commas
        const words = s.split(/([,،\s]+)/).filter(Boolean);
        let sub = '';
        for (const w of words) {
          if ((sub + w).trim().length <= maxChars) {
            sub = sub + w;
          } else {
            if (sub.trim()) chunks.push(sub.trim());
            sub = w;
          }
        }
        if (sub.trim()) current = sub.trim();
        else current = '';
      } else {
        current = s;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Extract chapters/sections from book data
function extractChapters(bookData) {
  const chapters = [];

  // Format 1: Standard sections array
  if (Array.isArray(bookData.sections)) {
    for (const sec of bookData.sections) {
      const title = sec.title || sec.heading || 'Chapter';
      const subtitle = sec.subtitle || '';
      const paragraphs = [];
      if (Array.isArray(sec.blocks)) {
        for (const b of sec.blocks) {
          if (b.text) paragraphs.push(b.text);
        }
      } else if (Array.isArray(sec.paragraphs)) {
        paragraphs.push(...sec.paragraphs);
      }
      chapters.push({
        title: subtitle ? `${title} — ${subtitle}` : title,
        shortTitle: title,
        text: `${title}। ${subtitle ? subtitle + '। ' : ''}` + paragraphs.join('\n\n'),
      });
    }
    return chapters;
  }

  // Format 2: book.chapters array (e.g. sukshm-sansar.json, the-subtle-worlds.json)
  const b = bookData.book || bookData;
  if (Array.isArray(b.chapters)) {
    for (const ch of b.chapters) {
      const title = ch.title || 'Chapter';
      const intro = (ch.intro_paragraphs || []).join('\n\n');
      const secTexts = (ch.sections || []).map((s) => {
        const h = s.heading ? `${s.heading}। ` : '';
        const p = (s.paragraphs || []).join('\n\n');
        return h + p;
      }).join('\n\n');

      chapters.push({
        title,
        shortTitle: title.split(':')[0] || title,
        text: `${title}। ` + (intro ? intro + '\n\n' : '') + secTexts,
      });
    }
    return chapters;
  }

  return chapters;
}

// Synthesize a single chunk with retry
async function synthesizeChunk(text, lang, speaker, retries = 3) {
  const target_language_code = lang === 'en' ? 'en-IN' : 'hi-IN';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': SARVAM_API_KEY,
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code,
          speaker: speaker || 'shubh',
          model: 'bulbul:v3',
          pace: 0.95,
        }),
      });

      if (res.status === 429) {
        console.warn(`[429 Rate Limit] Waiting ${attempt * 3}s before retry...`);
        await sleep(attempt * 3000);
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Sarvam API Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      if (!data.audios || !data.audios[0]) {
        throw new Error('No audio returned in response');
      }

      return Buffer.from(data.audios[0], 'base64');
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Attempt ${attempt} failed: ${err.message}. Retrying...`);
      await sleep(1500 * attempt);
    }
  }
}

// Synthesize one chapter and save to MP3
async function generateChapterMp3(chapter, chapterIndex, bookOutDir, lang, speaker) {
  const chapterNum = String(chapterIndex + 1).padStart(2, '0');
  const finalMp3 = path.join(bookOutDir, `chapter-${chapterNum}.mp3`);

  // Check if already generated
  if (fs.existsSync(finalMp3) && fs.statSync(finalMp3).size > 20000) {
    console.log(`  ✓ Chapter ${chapterNum} already exists (${(fs.statSync(finalMp3).size / 1024).toFixed(0)} KB), skipping.`);
    return finalMp3;
  }

  const chunks = splitIntoChunks(chapter.text, 450);
  console.log(`  → Synthesizing Chapter ${chapterNum} ("${chapter.shortTitle}"): ${chunks.length} chunks (${chapter.text.length} chars)`);

  const tempDir = path.join(bookOutDir, `temp-${chapterNum}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const tempWavs = [];
  try {
    for (let i = 0; i < chunks.length; i++) {
      const wavFile = path.join(tempDir, `part-${String(i).padStart(3, '0')}.wav`);
      if (!fs.existsSync(wavFile) || fs.statSync(wavFile).size < 1000) {
        const wavBuf = await synthesizeChunk(chunks[i], lang, speaker);
        fs.writeFileSync(wavFile, wavBuf);
        await sleep(DELAY_BETWEEN_CALLS);
      }
      tempWavs.push(wavFile);
      process.stdout.write(`\r    Chunk ${i + 1}/${chunks.length} done`);
    }
    console.log('');

    // Concatenate all WAVs into one MP3 via ffmpeg
    const listFile = path.join(tempDir, 'concat_list.txt');
    const listContent = tempWavs.map((w) => `file '${path.resolve(w).replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(listFile, listContent);

    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c:a libmp3lame -b:a 48k -ar 24000 -ac 1 "${finalMp3}"`,
      { stdio: 'pipe' }
    );

    console.log(`  ✓ Created: chapter-${chapterNum}.mp3 (${(fs.statSync(finalMp3).size / 1024).toFixed(0)} KB)`);
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (_) {}
  }

  return finalMp3;
}

// Generate an entire book
async function generateBook(manifestItem) {
  console.log(`\n======================================================`);
  console.log(`Starting Audiobook: ${manifestItem.titleEnglish} (${manifestItem.lang.toUpperCase()})`);
  console.log(`Slug: ${manifestItem.slug} | File: ${manifestItem.file}`);
  console.log(`======================================================`);

  const bookFilePath = path.join(BOOKS_DIR, manifestItem.file);
  if (!fs.existsSync(bookFilePath)) {
    console.error(`Book file not found: ${bookFilePath}`);
    return;
  }

  const bookData = JSON.parse(fs.readFileSync(bookFilePath, 'utf8'));
  const chapters = extractChapters(bookData);
  console.log(`Found ${chapters.length} chapters.`);

  const bookOutDir = path.join(OUTPUT_DIR, manifestItem.slug);
  fs.mkdirSync(bookOutDir, { recursive: true });

  for (let i = 0; i < chapters.length; i++) {
    await generateChapterMp3(chapters[i], i, bookOutDir, manifestItem.lang, manifestItem.speaker);
  }

  console.log(`✓ Completed audiobook for: ${manifestItem.titleEnglish}`);
}

// Main CLI
async function main() {
  const args = process.argv.slice(2);
  const bookArgIndex = args.indexOf('--book');
  const targetSlug = bookArgIndex !== -1 ? args[bookArgIndex + 1] : null;

  if (args.includes('--list')) {
    console.log('Available books:');
    LIBRARY_MANIFEST.forEach((b) => console.log(` - ${b.slug} (${b.lang}) - ${b.titleEnglish}`));
    return;
  }

  if (targetSlug) {
    const item = LIBRARY_MANIFEST.find((b) => b.slug === targetSlug);
    if (!item) {
      console.error(`Book with slug "${targetSlug}" not found in manifest.`);
      process.exit(1);
    }
    await generateBook(item);
  } else {
    console.log(`Starting generation for all ${LIBRARY_MANIFEST.length} books...`);
    for (const item of LIBRARY_MANIFEST) {
      await generateBook(item);
    }
  }

  console.log('\nAll requested audiobooks finished successfully!');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = {
  LIBRARY_MANIFEST,
  extractChapters,
  splitIntoChunks,
};
