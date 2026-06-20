// ─────────────────────────────────────────────────────────────
//  src/lib/course-data.ts
//  Static data for the Nirvan Sutra course
// ─────────────────────────────────────────────────────────────

export type CourseLang = 'hi' | 'en' | 'hl';

/** Alias kept for spec compatibility */
export type CourseLanguage = CourseLang;

export interface FinalTestQuestion {
  id: number;
  question: string;
}

// ─── Chapter definitions ───────────────────────────────────────────────────────

export const COURSE_CHAPTERS = [
  {
    num: 1,
    titleHi: '\u0938\u094d\u0935\u092f\u0902 \u0915\u0940 \u0916\u094b\u091c',
    titleEn: 'Self-Discovery',
    titleHl: 'Swayam Ki Khoj',
    subtitleHi: '\u092e\u0948\u0902 \u0915\u094c\u0928 \u0939\u0942\u0901?',
    subtitleEn: 'Who Am I?',
    subtitleHl: 'Main Kaun Hoon?',
  },
  {
    num: 2,
    titleHi: '\u092e\u0928 \u0915\u0940 \u092a\u0930\u0924\u0947\u0902',
    titleEn: 'Layers of Mind',
    titleHl: 'Mann Ki Partein',
    subtitleHi: '\u0935\u093f\u091a\u093e\u0930 \u0914\u0930 \u092d\u093e\u0935',
    subtitleEn: 'Thoughts & Emotions',
    subtitleHl: 'Vichar aur Bhaav',
  },
  {
    num: 3,
    titleHi: '\u0938\u093e\u0915\u094d\u0937\u0940 \u092c\u094b\u0927',
    titleEn: 'Witness Awareness',
    titleHl: 'Sakshi Bodh',
    subtitleHi: '\u0926\u0947\u0916\u0928\u0947 \u0935\u093e\u0932\u093e \u0915\u094c\u0928 \u0939\u0948?',
    subtitleEn: 'Who Is The Witness?',
    subtitleHl: 'Dekhne Wala Kaun Hai?',
  },
  {
    num: 4,
    titleHi: '\u0905\u0939\u0902\u0915\u093e\u0930 \u0915\u0940 \u091c\u0921\u093c',
    titleEn: 'Root of Ego',
    titleHl: 'Ahankar Ki Jad',
    subtitleHi: '\u092e\u0948\u0902-\u092a\u0928 \u0915\u0939\u093e\u0901 \u0938\u0947 \u0906\u0924\u093e \u0939\u0948?',
    subtitleEn: 'Where Does "I" Arise?',
    subtitleHl: '"Main" Kahan Se Aata Hai?',
  },
  {
    num: 5,
    titleHi: '\u092e\u093e\u092f\u093e \u0915\u093e \u0916\u0947\u0932',
    titleEn: 'The Play of Maya',
    titleHl: 'Maya Ka Khel',
    subtitleHi: '\u092d\u094d\u0930\u092e \u0914\u0930 \u0938\u0924\u094d\u092f',
    subtitleEn: 'Illusion & Truth',
    subtitleHl: 'Bhram aur Satya',
  },
  {
    num: 6,
    titleHi: '\u0927\u094d\u092f\u093e\u0928 \u0915\u093e \u0926\u094d\u0935\u093e\u0930',
    titleEn: 'Gateway of Meditation',
    titleHl: 'Dhyan Ka Dwar',
    subtitleHi: '\u0938\u094d\u0925\u093f\u0930\u0924\u093e \u0914\u0930 \u0936\u093e\u0902\u0924\u093f',
    subtitleEn: 'Stillness & Peace',
    subtitleHl: 'Sthirta aur Shanti',
  },
  {
    num: 7,
    titleHi: '\u092e\u0941\u0915\u094d\u0924\u093f \u0915\u0940 \u0930\u093e\u0939',
    titleEn: 'Path of Liberation',
    titleHl: 'Mukti Ki Raah',
    subtitleHi: '\u092c\u0902\u0927\u0928 \u0915\u0948\u0938\u0947 \u091f\u0942\u091f\u0924\u093e \u0939\u0948?',
    subtitleEn: 'How Bondage Dissolves',
    subtitleHl: 'Bandhan Kaise Toota?',
  },
  {
    num: 8,
    titleHi: '\u0928\u093f\u0930\u094d\u0935\u093e\u0923 \u0938\u0942\u0924\u094d\u0930',
    titleEn: 'Nirvan Sutra',
    titleHl: 'Nirvan Sutra',
    subtitleHi: '\u092a\u0942\u0930\u094d\u0923\u0924\u093e \u0915\u093e \u092c\u094b\u0927',
    subtitleEn: 'Recognition of Wholeness',
    subtitleHl: 'Purnata Ka Bodh',
  },
] as const;

export type CourseChapter = (typeof COURSE_CHAPTERS)[number];

export const TOTAL_CHAPTERS = COURSE_CHAPTERS.length;

// ─── Language options ─────────────────────────────────────────────────────────

export const COURSE_LANGUAGES = [
  { code: 'hi' as const, label: '\u0939\u093f\u0902\u0926\u0940', sublabel: 'Devanagari' },
  { code: 'en' as const, label: 'English', sublabel: 'Roman' },
  { code: 'hl' as const, label: 'Hinglish', sublabel: 'Roman Hindi' },
] as const;

// ─── Stage metadata ────────────────────────────────────────────────────────────
export const STAGES = [
  {
    id: 'shravan',
    hi: '\u0936\u094d\u0930\u0935\u0923',
    en: 'Shravana',
    desc_hi: '8 \u0917\u0939\u0930\u0947 \u0905\u0927\u094d\u092f\u093e\u092f \u00b7 \u0905\u092d\u094d\u092f\u093e\u0938 \u092a\u094d\u0930\u0936\u094d\u0928 \u00b7 \u091c\u094d\u091e\u093e\u0928 \u092a\u0930\u0940\u0915\u094d\u0937\u0923',
    desc_en: '8 Deep Chapters \u00b7 Practice Questions \u00b7 Knowledge Test',
    locked: false,
  },
  {
    id: 'manan',
    hi: '\u092e\u0928\u0928',
    en: 'Manana',
    desc_hi: '\u0909\u0928\u094d\u0928\u0924 \u0927\u094d\u092f\u093e\u0928 \u0938\u093e\u0927\u0928\u093e',
    desc_en: 'Advanced Meditation Practice',
    locked: true,
  },
  {
    id: 'nididhyasan',
    hi: '\u0928\u093f\u0926\u093f\u0927\u094d\u092f\u093e\u0938\u0928',
    en: 'Nididhyasana',
    desc_hi: '4 \u092e\u093e\u0939 \u0917\u0941\u0930\u0941 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928',
    desc_en: '4 Months of Guru Guidance',
    locked: true,
  },
] as const;

// ─── Final Test Questions (spec-required format) ───────────────────────────────

export const FINAL_TEST_QUESTIONS: Record<CourseLang, readonly string[]> = {
  hi: [
    '"\u092e\u0948\u0902" \u0915\u093e \u0935\u093e\u0938\u094d\u0924\u0935\u093f\u0915 \u0938\u094d\u0935\u0930\u0942\u092a \u0915\u094d\u092f\u093e \u0939\u0948? \u0905\u092a\u0928\u0947 \u0905\u0928\u0941\u092d\u0935 \u0938\u0947 \u092c\u0924\u093e\u090f\u0902\u0964',
    '\u0938\u093e\u0915\u094d\u0937\u0940 \u0914\u0930 \u0905\u0928\u0941\u092d\u0935\u0915\u0930\u094d\u0924\u093e \u092e\u0947\u0902 \u0915\u094d\u092f\u093e \u0905\u0902\u0924\u0930 \u0939\u0948? \u0909\u0926\u093e\u0939\u0930\u0923 \u0938\u0947 \u0938\u092e\u091d\u093e\u090f\u0902\u0964',
    '\u092e\u093e\u092f\u093e \u0915\u094d\u092f\u093e \u0939\u0948? \u092f\u0939 \u0915\u0948\u0938\u0947 \u0915\u093e\u092e \u0915\u0930\u0924\u0940 \u0939\u0948?',
    '\u0905\u0939\u0902\u0915\u093e\u0930 \u0915\u0948\u0938\u0947 \u092c\u0928\u0924\u093e \u0939\u0948? \u0907\u0938\u0947 \u091c\u093e\u0928\u0928\u0947 \u0938\u0947 \u0915\u094d\u092f\u093e \u0939\u094b\u0924\u093e \u0939\u0948?',
    '\u0927\u094d\u092f\u093e\u0928 \u0915\u093e \u0909\u0926\u094d\u0926\u0947\u0936\u094d\u092f \u0915\u094d\u092f\u093e \u0939\u0948 \u2014 \u090f\u0915\u093e\u0917\u094d\u0930\u0924\u093e \u092f\u093e \u091c\u093e\u0917\u0930\u0923?',
    '\u0906\u092a\u0915\u0947 \u091c\u0940\u0935\u0928 \u092e\u0947\u0902 \u0907\u0938 \u0915\u094b\u0930\u094d\u0938 \u0915\u0947 \u092c\u093e\u0926 \u0915\u094d\u092f\u093e \u092c\u0926\u0932\u093e?',
    '\u092e\u0928 \u0915\u094b \u0936\u093e\u0902\u0924 \u0915\u0930\u0928\u093e \u0915\u094d\u092f\u093e \u092e\u0941\u0915\u094d\u0924\u093f \u0939\u0948?',
    '"\u092e\u0948\u0902 \u0936\u0930\u0940\u0930 \u0928\u0939\u0940\u0902 \u0939\u0942\u0901" \u2014 \u0907\u0938\u0947 \u0915\u0947\u0935\u0932 \u092e\u093e\u0928\u0928\u0947 \u0914\u0930 \u0938\u091a\u092e\u0941\u091a \u091c\u093e\u0928\u0928\u0947 \u092e\u0947\u0902 \u0915\u094d\u092f\u093e \u092b\u0930\u094d\u0915 \u0939\u0948?',
    '\u0935\u093f\u091a\u093e\u0930 \u0914\u0930 \u0935\u093f\u091a\u093e\u0930\u0915\u0930\u094d\u0924\u093e \u2014 \u0907\u0928\u092e\u0947\u0902 \u0938\u0947 \u0915\u094c\u0928 \u0935\u093e\u0938\u094d\u0924\u0935\u093f\u0915 \u0939\u0948?',
    '\u0938\u093e\u0927\u0928\u093e \u0915\u093e \u0938\u092c\u0938\u0947 \u092c\u0921\u093c\u093e \u092d\u094d\u0930\u092e \u0915\u094d\u092f\u093e \u0939\u0948?',
    '\u092a\u094d\u0930\u0947\u092e \u0914\u0930 \u0906\u0938\u0915\u094d\u0924\u093f \u092e\u0947\u0902 \u0915\u094d\u092f\u093e \u0905\u0902\u0924\u0930 \u0939\u0948?',
    '\u091c\u093e\u0917\u0930\u0923 \u0924\u0941\u0930\u0902\u0924 \u0939\u094b\u0924\u093e \u0939\u0948 \u092f\u093e \u0927\u0940\u0930\u0947-\u0927\u0940\u0930\u0947?',
    '\u0928\u093f\u0930\u094d\u0935\u093e\u0923 \u0915\u093e \u0905\u0930\u094d\u0925 \u0915\u094d\u092f\u093e \u0939\u0948 \u2014 \u0906\u092a\u0915\u0940 \u0938\u092e\u091d \u092e\u0947\u0902?',
    '\u0917\u0941\u0930\u0941 \u0915\u0940 \u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e \u0915\u094d\u092f\u094b\u0902 \u0939\u0948 \u092f\u093e \u0915\u094d\u092f\u094b\u0902 \u0928\u0939\u0940\u0902?',
    '\u0915\u094d\u092f\u093e \u0938\u094d\u0935\u092f\u0902 \u0915\u094b \u091c\u093e\u0928\u0928\u093e \u0938\u0902\u092d\u0935 \u0939\u0948? \u0915\u0948\u0938\u0947?',
    '\u0926\u0941\u0916 \u0915\u093e \u092e\u0942\u0932 \u0915\u093e\u0930\u0923 \u0915\u094d\u092f\u093e \u0939\u0948?',
    '\u0905\u0926\u094d\u0935\u0948\u0924 \u0915\u093e \u0935\u094d\u092f\u093e\u0935\u0939\u093e\u0930\u093f\u0915 \u0905\u0930\u094d\u0925 \u0915\u094d\u092f\u093e \u0939\u0948?',
    '\u092e\u0943\u0924\u094d\u092f\u0941 \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u0906\u092a\u0915\u0940 \u0938\u092e\u091d \u0907\u0938 \u0915\u094b\u0930\u094d\u0938 \u0915\u0947 \u092c\u093e\u0926 \u0915\u0948\u0938\u0947 \u092c\u0926\u0932\u0940?',
    '\u0915\u094d\u092f\u093e \u0906\u092a \u0905\u092d\u0940 \u092e\u0941\u0915\u094d\u0924 \u0939\u0948\u0902? \u0915\u094d\u092f\u094b\u0902 \u092f\u093e \u0915\u094d\u092f\u094b\u0902 \u0928\u0939\u0940\u0902?',
    '\u0907\u0938 \u092f\u093e\u0924\u094d\u0930\u093e \u092e\u0947\u0902 \u0938\u092c\u0938\u0947 \u0915\u0920\u093f\u0928 \u0915\u094d\u092f\u093e \u0932\u0917\u093e?',
    '\u0905\u0917\u0930 \u0915\u093f\u0938\u0940 \u092e\u093f\u0924\u094d\u0930 \u0915\u094b \u092f\u0939 \u0915\u094b\u0930\u094d\u0938 \u0938\u092e\u091d\u093e\u0928\u093e \u0939\u094b, \u0924\u094b \u0906\u092a \u0915\u094d\u092f\u093e \u0915\u0939\u0947\u0902\u0917\u0947?',
  ],
  en: [
    'What is the true nature of "I"? Describe from your own experience.',
    'What is the difference between the witness and the experiencer? Give an example.',
    'What is Maya? How does it function?',
    'How does the ego form? What happens when it is seen clearly?',
    'What is the purpose of meditation — concentration or awakening?',
    'What has changed in your life after this course?',
    'Is silencing the mind the same as liberation?',
    '"I am not the body" — what is the difference between believing this and truly knowing it?',
    'Thought and thinker — which one is real?',
    'What is the greatest illusion on the spiritual path?',
    'What is the difference between love and attachment?',
    'Does awakening happen suddenly or gradually?',
    'What does Nirvana mean to you now?',
    'Why is a Guru necessary — or is it not?',
    'Is it possible to know oneself? How?',
    'What is the root cause of suffering?',
    'What is the practical meaning of Advaita (non-duality)?',
    'How has your understanding of death changed after this course?',
    'Are you free right now? Why or why not?',
    'What was the most difficult part of this journey?',
    'If you had to explain this course to a friend, what would you say?',
  ],
  hl: [
    '"Main" ka asli swaroop kya hai? Apne anubhav se batayein.',
    'Sakshi aur anubhavkarta mein kya antar hai? Udaaharan se samjhayein.',
    'Maya kya hai? Yeh kaise kaam karti hai?',
    'Ahankar kaise banta hai? Ise jaanne se kya hota hai?',
    'Dhyan ka uddeshya kya hai — ekagrata ya jaagran?',
    'Is course ke baad aapke jeevan mein kya badla?',
    'Mann ko shant karna kya mukti hai?',
    '"Main sharir nahi hoon" — sirf maanne aur sachchi jaanne mein kya fark hai?',
    'Vichar aur vicharkarta — dono mein se kaun asli hai?',
    'Sadhana ka sabse bada bhram kya hai?',
    'Prem aur aasakti mein kya antar hai?',
    'Jaagran turant hota hai ya dheere dheere?',
    'Nirvaan ka matlab kya hai — aapki samajh mein?',
    'Guru ki zaroorat kyon hai ya kyon nahi?',
    'Kya swayam ko jaanna sambhav hai? Kaise?',
    'Dukh ka mool kaaran kya hai?',
    'Advaita ka vyavaharik arth kya hai?',
    'Mrityu ke baare mein aapki samajh is course ke baad kaise badli?',
    'Kya aap abhi mukt hain? Kyon ya kyon nahi?',
    'Is yatra mein sabse kathin kya laga?',
    'Agar kisi mitra ko yeh course samjhaana ho, toh aap kya kahenge?',
  ],
};
