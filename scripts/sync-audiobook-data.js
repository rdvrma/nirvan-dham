/**
 * Nirvan Dham — Sync Audiobook Data with UI
 * 
 * Automatically generates src/lib/audiobook-data.ts based on the
 * books in src/content/books/ and generated MP3s in public/library/audiobooks/
 */

const fs = require('fs');
const path = require('path');
const { LIBRARY_MANIFEST, extractChapters } = require('./generate-audiobooks');

const BOOKS_DIR = path.join(__dirname, '..', 'src', 'content', 'books');
const AUDIO_DIR = path.join(__dirname, '..', 'public', 'library', 'audiobooks');
const TARGET_FILE = path.join(__dirname, '..', 'src', 'lib', 'audiobook-data.ts');

function sync() {
  console.log('Syncing audiobook data with UI...');

  const hindiBooks = [];
  const englishBooks = [];

  for (const item of LIBRARY_MANIFEST) {
    const bookFilePath = path.join(BOOKS_DIR, item.file);
    if (!fs.existsSync(bookFilePath)) continue;

    const bookData = JSON.parse(fs.readFileSync(bookFilePath, 'utf8'));
    const chapters = extractChapters(bookData);

    const trackTitles = chapters.map((c) => c.title);

    const entry = {
      slug: item.slug,
      titleHindi: item.titleHindi,
      titleEnglish: item.titleEnglish,
      subtitleHindi: item.subtitleHindi,
      subtitleEnglish: item.subtitleEnglish,
      moodHindi: item.moodHindi,
      moodEnglish: item.moodEnglish,
      accent: item.accent,
      trackTitles,
    };

    if (item.lang === 'hi') {
      hindiBooks.push(entry);
    } else {
      englishBooks.push(entry);
    }
  }

  function renderBookList(list) {
    const items = list.map((b) => {
      const titlesJson = JSON.stringify(b.trackTitles);
      return `  {
    slug: ${JSON.stringify(b.slug)},
    titleHindi: ${JSON.stringify(b.titleHindi)},
    titleEnglish: ${JSON.stringify(b.titleEnglish)},
    subtitleHindi: ${JSON.stringify(b.subtitleHindi)},
    subtitleEnglish: ${JSON.stringify(b.subtitleEnglish)},
    moodHindi: ${JSON.stringify(b.moodHindi)},
    moodEnglish: ${JSON.stringify(b.moodEnglish)},
    accent: ${JSON.stringify(b.accent)},
    tracks: makeTracks(${JSON.stringify(b.slug)}, ${titlesJson}),
  },`;
    });
    return `[\n${items.join('\n')}\n];`;
  }

  const code = `export interface AudioTrack {
  id: string;
  title: string;
  src: string;
}

export interface AudiobookItem {
  slug: string;
  titleHindi: string;
  titleEnglish: string;
  subtitleHindi: string;
  subtitleEnglish: string;
  moodHindi: string;
  moodEnglish: string;
  accent: string;
  tracks: AudioTrack[];
}

function makeTracks(slug: string, titles: string[]): AudioTrack[] {
  return titles.map((title, index) => {
    const chapter = String(index + 1).padStart(2, '0');
    return {
      id: \`\${slug}-\${chapter}\`,
      title,
      src: \`/library/audiobooks/\${slug}/chapter-\${chapter}.mp3\`,
    };
  });
}

export const HINDI_AUDIOBOOKS: AudiobookItem[] = ${renderBookList(hindiBooks)}

export const ENGLISH_AUDIOBOOKS: AudiobookItem[] = ${renderBookList(englishBooks)}
`;

  fs.writeFileSync(TARGET_FILE, code, 'utf8');
  console.log('✓ Successfully updated src/lib/audiobook-data.ts!');
}

if (require.main === module) {
  sync();
}

module.exports = sync;
