import { MetadataRoute } from 'next';
import { EBOOKS, MAGAZINES, isMagazineReadable } from '@/lib/library-data';
import { getAllBlogPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.nirvandham.in';
  
  // Base static routes
  const routes = [
    '',
    '/about-aadisatv',
    '/nirvan-sutra',
    '/course',
    '/nirvan-shakti-snan-sadhna',
    '/spiritual-guidance',
    '/online-samvad',
    '/bodhgaya-samvad',
    '/guided-meditation',
    '/library',
    '/library/audiobooks',
    '/faq',
    '/donation',
    '/blog',
    '/ichchha-poorti'
  ];

  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const bookRoutes = EBOOKS
    .filter((book) => !book.isPlaceholder && book.pdf)
    .flatMap((book) => [
      {
        url: `${baseUrl}/library/${book.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.72,
      },
      {
        url: `${baseUrl}/library/${book.slug}/read`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.68,
      },
    ]);

  const magazineRoutes = MAGAZINES
    .filter((magazine) => isMagazineReadable(magazine))
    .map((magazine) => ({
      url: `${baseUrl}/library/magazine/${magazine.slug}/read`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const blogRoutes = getAllBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...bookRoutes, ...magazineRoutes, ...blogRoutes];
}
