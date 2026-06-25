import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login', '/signup', '/course/hi/', '/course/en/', '/course/hl/'],
    },
    sitemap: 'https://nirvandham.in/sitemap.xml',
  };
}
