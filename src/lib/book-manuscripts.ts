import advaitaKaBodh from '@/content/books/advaita-ka-bodh.json';
import mainKaunHoon from '@/content/books/main-kaun-hoon.json';
import ishwarKaunHai from '@/content/books/ishwar-kaun-hai.json';
import mayaKeMaze from '@/content/books/maya-ke-maze.json';
import mayaAndMind from '@/content/books/maya-and-mind.json';
import mayaAurMan from '@/content/books/maya-aur-man.json';
import realizationOfAdvaita from '@/content/books/realization-of-advaita.json';
import shivaAndShakti from '@/content/books/shiva-and-shakti.json';
import shivAurShakti from '@/content/books/shiv-aur-shakti.json';
import tantraConfluenceOfPaths from '@/content/books/tantra-confluence-of-paths.json';
import tantraMargonKaSangam from '@/content/books/tantra-margon-ka-sangam.json';
import theJoysOfMaya from '@/content/books/the-joys-of-maya.json';
import theSeekerIsTheIllusion from '@/content/books/the-seeker-is-the-illusion.json';
import whoIsGod from '@/content/books/who-is-god.json';
import yogSwayamKiOr from '@/content/books/yog-swayam-ki-or.json';
import yogaTowardTheSelf from '@/content/books/yoga-toward-the-self.json';
import sukshmSansar from '@/content/books/sukshm-sansar.json';
import theSubtleWorlds from '@/content/books/the-subtle-worlds.json';

export type ManuscriptLanguage = 'hi' | 'en';

export interface ManuscriptBlock {
  type: 'paragraph' | 'heading';
  text: string;
  level?: number;
}

export interface ManuscriptSection {
  id: string;
  type: string;
  number: number | null;
  title: string;
  subtitle?: string;
  blocks: ManuscriptBlock[];
  contentMarkdown?: string;
}

export interface BookManuscript {
  id: string;
  language: ManuscriptLanguage;
  title: string;
  subtitle?: string;
  series?: string;
  bookNumber?: string;
  author: string;
  authorDevanagari?: string;
  sections: ManuscriptSection[];
  tableOfContents?: Array<{
    title: string;
    subtitle?: string;
    type?: string;
  }>;
}

const manuscripts: Record<string, BookManuscript> = {
  'main-kaun-hoon': asBookManuscript(mainKaunHoon),
  'ishwar-kaun-hai': asBookManuscript(ishwarKaunHai),
  'advaita-ka-bodh': asBookManuscript(advaitaKaBodh),
  'shiv-aur-shakti': asBookManuscript(shivAurShakti),
  'maya-aur-man': asBookManuscript(mayaAurMan),
  'the-seeker-is-the-illusion': asBookManuscript(theSeekerIsTheIllusion),
  'maya-and-mind': asBookManuscript(mayaAndMind),
  'who-is-god': asBookManuscript(whoIsGod),
  'realization-of-advaita': asBookManuscript(realizationOfAdvaita),
  'shiva-and-shakti': asBookManuscript(shivaAndShakti),
  'yog-swayam-ki-or': asBookManuscript(yogSwayamKiOr),
  'yoga-toward-the-self': asBookManuscript(yogaTowardTheSelf),
  'tantra-margon-ka-sangam': asBookManuscript(tantraMargonKaSangam),
  'tantra-confluence-of-paths': asBookManuscript(tantraConfluenceOfPaths),
  'maya-ke-maze': asBookManuscript(mayaKeMaze),
  'the-joys-of-maya': asBookManuscript(theJoysOfMaya),
  'sukshm-sansar': asBookManuscript(sukshmSansar, 'sukshm-sansar'),
  'the-subtle-worlds': asBookManuscript(theSubtleWorlds, 'the-subtle-worlds'),
};

export function getBookManuscript(slug: string): BookManuscript | null {
  return manuscripts[slug as keyof typeof manuscripts] || null;
}

export function hasBookManuscript(slug: string) {
  return Boolean(getBookManuscript(slug));
}

interface SourceBookSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

interface SourceBookChapter {
  id: string;
  type: string;
  title: string;
  intro_paragraphs: string[];
  sections: SourceBookSection[];
}

interface SourceBook {
  title: string;
  subtitle?: string;
  series?: string;
  author: string;
  language: ManuscriptLanguage;
  chapters: SourceBookChapter[];
}

function asBookManuscript(value: unknown, id?: string): BookManuscript {
  const source = value as { book?: SourceBook };
  if (source.book) return adaptSourceBook(source.book, id);

  const manuscript = value as BookManuscript;
  if (manuscript.language !== 'hi' && manuscript.language !== 'en') {
    throw new Error(`Unsupported manuscript language for ${manuscript.id}`);
  }
  return manuscript;
}

// Converts later chapter/paragraph source files into the reader's existing shape.
function adaptSourceBook(book: SourceBook, id?: string): BookManuscript {
  if (!id || (book.language !== 'hi' && book.language !== 'en')) {
    throw new Error('Unsupported source manuscript');
  }

  return {
    id,
    language: book.language,
    title: book.title,
    subtitle: book.subtitle,
    series: book.series,
    author: book.author,
    authorDevanagari: book.language === 'hi' ? book.author : undefined,
    tableOfContents: book.chapters.map((chapter) => ({ title: chapter.title, type: chapter.type })),
    sections: book.chapters.map((chapter, index) => ({
      id: chapter.id,
      type: chapter.type,
      number: chapter.type === 'preface' ? null : index,
      title: chapter.title,
      blocks: [
        ...chapter.intro_paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
        ...chapter.sections.flatMap((section) => [
          { type: 'heading' as const, text: section.heading, level: 3 },
          ...section.paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
        ]),
      ],
    })),
  };
}
