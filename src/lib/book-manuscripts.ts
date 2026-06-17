import mainKaunHoon from '@/content/books/main-kaun-hoon.json';
import mayaAndMind from '@/content/books/maya-and-mind.json';
import mayaAurMan from '@/content/books/maya-aur-man.json';
import theSeekerIsTheIllusion from '@/content/books/the-seeker-is-the-illusion.json';

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
  'maya-aur-man': asBookManuscript(mayaAurMan),
  'the-seeker-is-the-illusion': asBookManuscript(theSeekerIsTheIllusion),
  'maya-and-mind': asBookManuscript(mayaAndMind),
};

export function getBookManuscript(slug: string): BookManuscript | null {
  return manuscripts[slug as keyof typeof manuscripts] || null;
}

export function hasBookManuscript(slug: string) {
  return Boolean(getBookManuscript(slug));
}

function asBookManuscript(value: unknown): BookManuscript {
  const manuscript = value as BookManuscript;
  if (manuscript.language !== 'hi' && manuscript.language !== 'en') {
    throw new Error(`Unsupported manuscript language for ${manuscript.id}`);
  }
  return manuscript;
}
