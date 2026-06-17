// ═══════════════════════════════════════
//  Nirvan Dham Digital Library — Data
// ═══════════════════════════════════════

export interface EBook {
  slug: string;
  titleHindi?: string;
  titleEnglish: string;
  subtitle?: string;
  subtitleHindi?: string;
  author: string;
  lang: 'hi' | 'en';
  cover: string;       // path in /public/library/covers/
  pdf: string;         // path in /public/library/ebooks/
  pageImages?: string[];
  libraryHref?: string;
  pages?: number;
  isPlaceholder?: boolean;
  description?: string;
  descriptionHindi?: string;
}

export interface AudioBook {
  slug: string;
  title: string;
  titleHindi?: string;
  author: string;
  duration?: string;
  cover?: string;
  isPlaceholder: boolean;
}

export interface Magazine {
  slug: string;
  name: string;
  nameHindi: string;
  issue: string;
  launchDate: string;  // ISO date
  nextIssueDate: string; // ISO date
  cover?: string;
  pdf?: string;
  pageImages?: string[];
  isPlaceholder: boolean;
  description: string;
  descriptionHindi: string;
}

// ── eBooks ──────────────────────────────────────────────
export const EBOOKS: EBook[] = [
  // ── Hindi ──
  {
    slug: 'main-kaun-hoon',
    titleHindi: 'मैं कौन हूँ',
    titleEnglish: 'Main Kaun Hoon',
    subtitleHindi: 'आत्म-अन्वेषण की सरल यात्रा',
    subtitle: 'A Simple Journey of Self-Inquiry',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '/library/covers/main-kaun-hoon.png',
    pdf: '/library/ebooks/main-kaun-hoon.pdf',
  },
  {
    slug: 'maya-aur-man',
    titleHindi: 'माया और मन',
    titleEnglish: 'Maya Aur Man',
    subtitleHindi: 'विचार, भ्रम और जागृति की पहचान',
    subtitle: 'Thought, Illusion & the Recognition of Awakening',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '/library/covers/maya-aur-man.png',
    pdf: '/library/ebooks/maya-aur-man.pdf',
  },
  {
    slug: 'atma-ka-sangeet-hi',
    titleHindi: 'आत्मा का संगीत',
    titleEnglish: 'The Music of the Self',
    subtitleHindi: 'चेतना के भीतर की लय',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '',
    pdf: '',
    isPlaceholder: true,
  },
  {
    slug: 'nirvan-ki-or',
    titleHindi: 'निर्वाण की ओर',
    titleEnglish: 'Toward Nirvana',
    subtitleHindi: 'मुक्ति का मार्ग',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '',
    pdf: '',
    isPlaceholder: true,
  },
  {
    slug: 'chetna-ka-prakash',
    titleHindi: 'चेतना का प्रकाश',
    titleEnglish: 'The Light of Consciousness',
    subtitleHindi: 'अद्वैत का प्रत्यक्ष अनुभव',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '',
    pdf: '',
    isPlaceholder: true,
  },

  // ── English ──
  {
    slug: 'the-seeker-is-the-illusion',
    titleEnglish: 'The Seeker Is the Illusion',
    subtitle: 'A Direct Inquiry into Non-Duality',
    author: 'Aadisatv',
    lang: 'en',
    cover: '/library/covers/the-seeker-is-the-illusion.png',
    pdf: '/library/ebooks/the-seeker-is-the-illusion.pdf',
  },
  {
    slug: 'maya-and-mind',
    titleEnglish: 'Maya and Mind',
    subtitle: 'Thought, Illusion & the Recognition of Awakening',
    author: 'Aadisatv',
    lang: 'en',
    cover: '/library/covers/maya-and-mind.png',
    pdf: '/library/ebooks/maya-and-mind.pdf',
  },
  {
    slug: 'the-silence-between',
    titleEnglish: 'The Silence Between',
    subtitle: 'Meditations on the Nature of Awareness',
    author: 'Aadisatv',
    lang: 'en',
    cover: '',
    pdf: '',
    isPlaceholder: true,
  },
  {
    slug: 'advaita-in-daily-life',
    titleEnglish: 'Advaita in Daily Life',
    subtitle: 'Non-Duality Beyond the Cushion',
    author: 'Aadisatv',
    lang: 'en',
    cover: '',
    pdf: '',
    isPlaceholder: true,
  },
  {
    slug: 'letters-to-a-seeker',
    titleEnglish: 'Letters to a Seeker',
    subtitle: 'Direct Pointings from Nirvan Dham',
    author: 'Aadisatv',
    lang: 'en',
    cover: '',
    pdf: '',
    isPlaceholder: true,
  },
];

// ── AudioBooks ───────────────────────────────────────────
export const AUDIOBOOKS: AudioBook[] = [
  {
    slug: 'nirvan-sutra-audio-1',
    title: 'Nirvan Sutra — Volume 1',
    titleHindi: 'निर्वाण सूत्र — भाग १',
    author: 'Aadisatv',
    duration: '~45 min',
    isPlaceholder: true,
  },
  {
    slug: 'maya-aur-man-audio',
    title: 'Maya Aur Man — Audio',
    titleHindi: 'माया और मन — श्रव्य',
    author: 'Aadisatv',
    duration: '~38 min',
    isPlaceholder: true,
  },
  {
    slug: 'guided-dhyan-1',
    title: 'Guided Dhyan — Session 1',
    titleHindi: 'निर्देशित ध्यान — सत्र १',
    author: 'Aadisatv',
    duration: '~22 min',
    isPlaceholder: true,
  },
  {
    slug: 'satsang-bodhgaya',
    title: 'Satsang at Bodhgaya',
    titleHindi: 'बोधगया सत्संग',
    author: 'Aadisatv',
    duration: '~60 min',
    isPlaceholder: true,
  },
];

// ── Magazine ─────────────────────────────────────────────
export const MAGAZINES: Magazine[] = [
  {
    slug: 'muktibodh-june-2026',
    name: 'Muktibodh',
    nameHindi: 'मुक्तिबोध',
    issue: 'June 2026 - Issue 01',
    launchDate: '2026-06-21',
    nextIssueDate: '2026-07-21',
    pdf: '/library/magazines/muktibodh-june-2026.pdf',
    pageImages: Array.from({ length: 35 }, (_, index) => `/library/magazines/muktibodh-june-2026/pages/page_${String(index + 1).padStart(2, '0')}.jpg`),
    isPlaceholder: false,
    description: 'Issue 01 of Muktibodh is available now. The next monthly edition continues the journal of consciousness, non-duality and the living teachings of Nirvan Dham.',
    descriptionHindi: 'मुक्तिबोध का प्रथम अंक अब उपलब्ध है। अगला मासिक अंक चेतना, अद्वैत और निर्वाण धाम की जीवंत शिक्षाओं की यात्रा को आगे बढ़ाएगा।',
  },
];

export function getEBookBySlug(slug: string) {
  return EBOOKS.find((b) => b.slug === slug);
}

export function getMagazineBySlug(slug: string) {
  return MAGAZINES.find((m) => m.slug === slug);
}
