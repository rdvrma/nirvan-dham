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
  issueNumber: number;
  monthLabel: string;
  launchDate: string;  // ISO date
  releaseDate: string; // ISO date
  nextIssueDate: string; // ISO date
  status: 'upcoming' | 'current' | 'archive';
  cover?: string;
  pdf?: string;
  pageImages?: string[];
  highlights?: string[];
  highlightsHindi?: string[];
  teaser?: string;
  teaserHindi?: string;
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
    descriptionHindi: 'यह पुस्तक उस एकमात्र प्रश्न की सरल और गहरी खोज है जो सभी प्रश्नों का उत्तर देता है — "मैं कौन हूँ?" आदिसत्व के साथ इस यात्रा में आप पाएँगे कि जो खोज रहा है वही उत्तर है। विचारों से परे, मन की सीमाओं से परे — वहाँ जो है, वह आप ही हैं।',
    description: 'A direct and gentle inquiry into the only question that dissolves all questions — "Who am I?" In this journey with Aadisatv, you will discover that the one who seeks is the answer itself. Beyond thought, beyond the boundaries of mind — what remains is what you truly are.',
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
    descriptionHindi: 'माया सिर्फ एक दार्शनिक विचार नहीं — यह वह पर्दा है जो हम अपने ही स्वरूप पर डाले हुए हैं। इस पुस्तक में आदिसत्व विचार की प्रकृति, मन के भ्रम और उस जागृति को उजागर करते हैं जो हमेशा से यहाँ है। माया को समझना ही मुक्ति की पहली किरण है।',
    description: 'Maya is not just a philosophical concept — it is the veil we have drawn over our own nature. In this book, Aadisatv illuminates the nature of thought, the illusions of the mind, and the awakening that has always been present. Understanding Maya is the first ray of liberation.',
  },
  {
    slug: 'ishwar-kaun-hai',
    titleHindi: 'ईश्वर कौन है',
    titleEnglish: 'Ishwar Kaun Hai',
    subtitleHindi: 'स्वरूप से अरूप तक',
    subtitle: 'From Form to Formless',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '/library/covers/ishwar-kaun-hai.png',
    pdf: '/library/ebooks/ishwar-kaun-hai.pdf',
    descriptionHindi: 'ईश्वर को रूप, भक्ति, माया, साक्षी और अरूप की यात्रा में देखने वाली सरल अद्वैत पुस्तक। प्रश्न बाहर से भीतर लौटता है और अंत में पूछने वाला ही उत्तर में पिघल जाता है।',
    description: 'A Hindi Advaita inquiry into Ishwar, moving from form and devotion toward the formless recognition of pure awareness.',
  },
  {
    slug: 'advaita-ka-bodh',
    titleHindi: 'अद्वैत का बोध',
    titleEnglish: 'Advaita Ka Bodh',
    subtitleHindi: 'शास्त्र से सत्य तक',
    subtitle: 'From Scripture to Truth',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '/library/covers/advaita-ka-bodh.png',
    pdf: '/library/ebooks/advaita-ka-bodh.pdf',
    descriptionHindi: 'अद्वैत को केवल शास्त्रीय विचार नहीं, बल्कि प्रत्यक्ष सत्य की तरह समझने की सरल और गहरी यात्रा। यह पुस्तक शब्दों, मान्यताओं और दर्शन से आगे ले जाकर देखने वाले को स्वयं देखने की ओर मोड़ती है।',
    description: 'A Hindi journey into Advaita, moving from scriptural understanding toward direct recognition of truth.',
  },
  {
    slug: 'shiv-aur-shakti',
    titleHindi: 'शिव और शक्ति',
    titleEnglish: 'Shiv Aur Shakti',
    subtitleHindi: 'जब दो नहीं, एक है',
    subtitle: 'When Two Are Not Two',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '/library/covers/shiv-aur-shakti.png',
    pdf: '/library/ebooks/shiv-aur-shakti.pdf',
    descriptionHindi: 'कश्मीर शैवदर्शन की रोशनी में शिव और शक्ति को दो अलग सिद्धांतों की तरह नहीं, बल्कि एक ही सत्य की मौन और स्पंदित अभिव्यक्ति की तरह देखने वाली पुस्तक।',
    description: 'A Hindi contemplative book on Shiv and Shakti as one indivisible reality, inspired by the insight of Kashmir Shaivism.',
  },
  {
    slug: 'yog-swayam-ki-or',
    titleHindi: 'योग: स्वयं की ओर',
    titleEnglish: 'Yog: Swayam Ki Or',
    subtitleHindi: 'शास्त्रों के आलोक में',
    subtitle: 'In the Light of the Scriptures',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '/library/covers/yog-swayam-ki-or.png',
    pdf: '/library/ebooks/yog-swayam-ki-or.pdf',
    descriptionHindi: 'योग को केवल आसन या अभ्यास नहीं, बल्कि स्वयं की ओर लौटने की शास्त्रीय और प्रत्यक्ष यात्रा की तरह खोलने वाली पुस्तक। पतंजलि, गीता और उपनिषदों के आलोक में साधना को भीतर की पहचान तक ले जाती है।',
    description: 'A Hindi contemplative journey into Yoga as the return toward the Self, explored in the light of the scriptures.',
  },
  {
    slug: 'tantra-margon-ka-sangam',
    titleHindi: 'तंत्र: मार्गों का संगम',
    titleEnglish: 'Tantra: Margon Ka Sangam',
    subtitleHindi: 'आगम से अद्वैत तक',
    subtitle: 'From Agama to Advaita',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '/library/covers/tantra-margon-ka-sangam.png',
    pdf: '/library/ebooks/tantra-margon-ka-sangam.pdf',
    descriptionHindi: 'तंत्र को संकीर्ण रहस्यवाद से मुक्त कर आगम, निगम, कुलमार्ग और अद्वैत की जीवित धारा के रूप में देखने वाली पुस्तक। यह साधक को मार्गों के भेद से आगे उनके एक ही सत्य-स्रोत की ओर ले जाती है।',
    description: 'A Hindi contemplative book on Tantra as a confluence of paths, moving from Agama toward Advaita.',
  },
  {
    slug: 'maya-ke-maze',
    titleHindi: 'माया के मज़े',
    titleEnglish: 'Maya Ke Maze',
    subtitleHindi: 'हँसी से मौन तक एक अद्वैत यात्रा',
    subtitle: 'A Non-Dual Journey from Laughter to Silence',
    author: 'Aadisatv',
    lang: 'hi',
    cover: '/library/covers/maya-ke-maze.png',
    pdf: '/library/ebooks/maya-ke-maze.pdf',
    descriptionHindi: 'माया को बोझ नहीं, मुस्कुराते हुए देखने की अद्वैत यात्रा। यह पुस्तक हँसी, हल्केपन और मौन के माध्यम से दिखाती है कि जो खेल दिख रहा है, वही जागरण का द्वार भी बन सकता है।',
    description: 'A Hindi contemplative journey that looks at Maya through laughter, lightness and silence.',
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
    description: 'What if the one searching for enlightenment is itself the obstacle? This book is a direct pointing — not toward a distant goal, but toward what is already and always present. Aadisatv dissolves the seeker and the sought in one clear recognition: there is only awareness, looking at itself.',
  },
  {
    slug: 'maya-and-mind',
    titleEnglish: 'Maya and Mind',
    subtitle: 'Thought, Illusion & the Recognition of Awakening',
    author: 'Aadisatv',
    lang: 'en',
    cover: '/library/covers/maya-and-mind.png',
    pdf: '/library/ebooks/maya-and-mind.pdf',
    description: 'Maya is not something outside of us — it is the movement of the mind mistaking itself for the world. In this luminous work, Aadisatv traces the mechanics of thought, the architecture of illusion, and the moment of recognition where mind sees through itself into pure awareness.',
  },
  {
    slug: 'who-is-god',
    titleEnglish: 'Who Is God?',
    subtitle: 'From Form to Formless',
    author: 'Aadisatv',
    lang: 'en',
    cover: '/library/covers/who-is-god.png',
    pdf: '/library/ebooks/who-is-god.pdf',
    description: 'A contemplative journey from the first human question of God toward the formless recognition of awareness itself. Through devotion, inquiry, witness-consciousness, and silence, Aadisatv gently turns the question outward and then back into the one who asks.',
  },
  {
    slug: 'realization-of-advaita',
    titleEnglish: 'The Realization of Advaita',
    subtitle: 'From Scripture to Truth',
    author: 'Aadisatv',
    lang: 'en',
    cover: '/library/covers/realization-of-advaita.png',
    pdf: '/library/ebooks/realization-of-advaita.pdf',
    description: 'A clear contemplative movement from the language of scripture into the lived recognition of non-duality. Aadisatv opens Advaita as a direct seeing rather than an idea to collect or defend.',
  },
  {
    slug: 'shiva-and-shakti',
    titleEnglish: 'Shiva and Shakti',
    subtitle: 'When Two Are One',
    author: 'Aadisatv',
    lang: 'en',
    cover: '/library/covers/shiva-and-shakti.png',
    pdf: '/library/ebooks/shiva-and-shakti.pdf',
    description: 'A contemplative English transcreation on Shiva and Shakti as one indivisible reality. Inspired by the living insight of Kashmir Shaivism, this book turns Tantra from outer mystery into direct recognition.',
  },
  {
    slug: 'yoga-toward-the-self',
    titleEnglish: 'Yoga: Toward the Self',
    subtitle: 'In the Light of the Scriptures',
    author: 'Aadisatv',
    lang: 'en',
    cover: '/library/covers/yoga-toward-the-self.png',
    pdf: '/library/ebooks/yoga-toward-the-self.pdf',
    description: 'A contemplative English transcreation on Yoga as the inward movement toward the Self. In the light of scripture, Aadisatv opens Yoga beyond posture and technique into direct recognition.',
  },
  {
    slug: 'tantra-confluence-of-paths',
    titleEnglish: 'Tantra: Confluence of Paths',
    subtitle: 'From Agama to Advaita',
    author: 'Aadisatv',
    lang: 'en',
    cover: '/library/covers/tantra-confluence-of-paths.png',
    pdf: '/library/ebooks/tantra-confluence-of-paths.pdf',
    description: 'A contemplative English transcreation on Tantra as the meeting point of Agama, living practice, devotion, energy, and non-dual recognition.',
  },
  {
    slug: 'the-joys-of-maya',
    titleEnglish: 'The Joys of Maya',
    subtitle: 'A Non-Dual Journey from Laughter to Silence',
    author: 'Aadisatv',
    lang: 'en',
    cover: '/library/covers/the-joys-of-maya.png',
    pdf: '/library/ebooks/the-joys-of-maya.pdf',
    description: 'A playful English transcreation on Maya as a doorway into lightness, laughter, and non-dual recognition.',
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
    issueNumber: 1,
    monthLabel: 'June 2026',
    launchDate: '2026-06-21',
    releaseDate: '2026-06-21',
    nextIssueDate: '2026-06-21',
    status: 'current',
    pdf: '/library/magazines/muktibodh-june-2026.pdf',
    pageImages: Array.from({ length: 35 }, (_, index) => `/library/magazines/muktibodh-june-2026/pages/page_${String(index + 1).padStart(2, '0')}.jpg`),
    highlights: [
      'Consciousness and non-duality reflections',
      'Meditation guidance from Nirvan Dham',
      'Seeker experiences and monthly contemplations',
    ],
    highlightsHindi: [
      'चेतना और अद्वैत पर चिंतन',
      'निरवाण धाम से ध्यान मार्गदर्शन',
      'साधक अनुभव और मासिक मनन',
    ],
    isPlaceholder: false,
    description: 'Issue 01 of Muktibodh is available now. The next monthly edition continues the journal of consciousness, non-duality and the living teachings of Nirvan Dham.',
    descriptionHindi: 'मुक्तिबोध का प्रथम अंक अब उपलब्ध है। अगला मासिक अंक चेतना, अद्वैत और निर्वाण धाम की जीवंत शिक्षाओं की यात्रा को आगे बढ़ाएगा।',
  },
  {
    slug: 'muktibodh-june-2026-issue-02',
    name: 'Muktibodh',
    nameHindi: 'मुक्तिबोध',
    issue: 'June 2026 - Issue 02',
    issueNumber: 2,
    monthLabel: 'June 2026',
    launchDate: '2026-06-21',
    releaseDate: '2026-06-21',
    nextIssueDate: '2026-07-21',
    status: 'upcoming',
    pdf: '/library/magazines/muktibodh-june-2026-issue-02.pdf',
    pageImages: Array.from({ length: 69 }, (_, index) => `/library/magazines/muktibodh-june-2026-issue-02/pages/page_${String(index + 1).padStart(2, '0')}.jpg`),
    teaser: 'The next Muktibodh issue continues the monthly journal of consciousness, direct inquiry and living sadhana.',
    teaserHindi: 'मुक्तिबोध का अगला अंक चेतना, प्रत्यक्ष आत्म-विचार और जीवंत साधना की मासिक यात्रा को आगे बढ़ाएगा।',
    isPlaceholder: false,
    description: 'Issue 02 of Muktibodh is scheduled for 21 June 2026. Read and download actions will appear when the issue is released.',
    descriptionHindi: 'मुक्तिबोध का दूसरा अंक 21 जून 2026 के लिए निर्धारित है। अंक प्रकाशित होने पर पढ़ने और डाउनलोड करने के विकल्प उपलब्ध होंगे।',
  },
];

export function getEBookBySlug(slug: string) {
  return EBOOKS.find((b) => b.slug === slug);
}

export function getMagazineBySlug(slug: string) {
  return MAGAZINES.find((m) => m.slug === slug);
}

export function hasMagazineAssets(magazine: Magazine) {
  return Boolean(magazine.pdf && magazine.pageImages?.length);
}

export function isMagazineReleased(magazine: Magazine, now: Date = new Date()) {
  return magazine.status !== 'upcoming' || now.getTime() >= new Date(magazine.releaseDate).getTime();
}

export function isMagazineReadable(magazine: Magazine, now: Date = new Date()) {
  return !magazine.isPlaceholder && hasMagazineAssets(magazine) && isMagazineReleased(magazine, now);
}
