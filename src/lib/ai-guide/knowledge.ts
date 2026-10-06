import { getAllBlogPosts, type BlogBlock } from '@/lib/blog';

type Language = 'hi' | 'en';

const RELATED_TERMS: Record<string, string[]> = {
  maya: ['माया'], dhyan: ['ध्यान', 'meditation'], meditation: ['ध्यान'],
  atma: ['आत्मा', 'self'], aatma: ['आत्मा', 'self'], self: ['आत्मा'],
  awareness: ['जागरूकता', 'साक्षी', 'चेतना'], sakshi: ['साक्षी', 'witness'],
  witness: ['साक्षी'], nirvan: ['निर्वाण'], shanti: ['शांति', 'peace'],
  ego: ['अहंकार'], karma: ['कर्म'], bhakti: ['भक्ति'],
};

const STOP_WORDS = new Set([
  'what', 'why', 'how', 'who', 'where', 'when', 'does', 'the', 'and', 'for', 'with',
  'this', 'that', 'can', 'you', 'your', 'about', 'please', 'tell', 'me', 'is', 'are',
  'kya', 'kaise', 'hai', 'hain', 'mujhe', 'batao', 'bataiye', 'aur', 'ka', 'ki', 'ke',
  'क्या', 'कैसे', 'है', 'हैं', 'मुझे', 'बताओ', 'और', 'का', 'की', 'के', 'में', 'यह',
]);

function terms(question: string): string[] {
  const words = (question.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  return [...new Set(words.flatMap((word) => [word, ...(RELATED_TERMS[word] ?? [])]))];
}

function blockScore(block: BlogBlock, words: string[]): number {
  const text = block.text.toLocaleLowerCase();
  return words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
}

/** Select bounded, published site text for the guide; no external corpus access is implied. */
export function teachingSupport(question: string, lang: Language): string {
  const words = terms(question);
  if (words.length === 0) return 'No directly relevant published article was selected.';

  const ranked = getAllBlogPosts().map((post) => {
    const localized = post[lang];
    const alternate = post[lang === 'hi' ? 'en' : 'hi'];
    const title = `${localized.title} ${alternate.title}`.toLocaleLowerCase();
    const rankedBlocks = localized.body
      .filter((block) => block.type === 'paragraph' && block.text.length > 50)
      .map((block) => ({ text: block.text, score: blockScore(block, words) }))
      .sort((a, b) => b.score - a.score);
    const titleScore = words.reduce((score, word) => score + (title.includes(word) ? 3 : 0), 0);
    return { post, title: localized.title, score: titleScore + (rankedBlocks[0]?.score ?? 0), blocks: rankedBlocks };
  }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

  if (ranked.length === 0) return 'No directly relevant published article was selected.';
  return ranked.map(({ post, title, blocks }) => {
    const excerpt = blocks.filter((block) => block.score > 0).slice(0, 2)
      .map((block) => block.text).join(' ').slice(0, 1300);
    return `Article: ${title}\nURL: https://www.nirvandham.in/blog/${post.slug}\nExcerpt: ${excerpt}`;
  }).join('\n\n');
}
