import blogData from './blog-data.json';
import type { Language } from '@/lib/i18n';

export type BlogBlock = {
  type: 'heading' | 'paragraph';
  text: string;
};

export type LocalizedBlogPost = {
  title: string;
  excerpt: string;
  body: BlogBlock[];
};

export type BlogPost = {
  id: number;
  slug: string;
  date: string;
  readingMinutesHi: number;
  readingMinutesEn: number;
  tags: string[];
  hi: LocalizedBlogPost;
  en: LocalizedBlogPost;
};

const posts = blogData as BlogPost[];

export function getAllBlogPosts() {
  return posts;
}

export function getBlogPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug) ?? null;
}

export function getLocalizedPost(post: BlogPost, lang: Language) {
  return post[lang];
}

export function getReadingMinutes(post: BlogPost, lang: Language) {
  return lang === 'hi' ? post.readingMinutesHi : post.readingMinutesEn;
}

export function getBlogImage(post: BlogPost, lang: Language = 'hi') {
  if (post.id < 1 || post.id > 39) return null;

  const localizedSuffix = lang === 'en' && post.id >= 11 && post.id <= 20 ? '-en' : '';

  return {
    src: `/blog/blog-${String(post.id).padStart(2, '0')}${localizedSuffix}.png`,
    width: 1680,
    height: 945,
    altHi: `${post.hi.title} - Nirvan Dham`,
    altEn: `${post.en.title} - Nirvan Dham`,
  };
}

export function getRelatedBlogPosts(post: BlogPost, limit = 3) {
  return posts
    .filter((item) => item.slug !== post.slug)
    .slice(Math.max(0, post.id - 2), post.id - 2 + limit);
}

export function getPostPlainText(post: BlogPost, lang: Language) {
  return post[lang].body
    .map((block) => block.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getPostSeoDescription(post: BlogPost, lang: Language) {
  const excerpt = post[lang].excerpt || getPostPlainText(post, lang);
  return excerpt.slice(0, 155);
}

// WordPress migration note:
// When this design is ported to WordPress, these fields map directly to WP posts:
// title -> post_title, excerpt -> post_excerpt, body -> post_content, slug -> post_name.
// Future posts should be served by the WordPress loop or REST API using this same shape.
