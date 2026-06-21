import { MetadataRoute } from 'next';
import { EBOOKS, MAGAZINES, isMagazineReadable } from '@/lib/library-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nirvandham.in';
  
  // Base static routes
  const routes = [
    '',
    '/about-aadisatv',
    '/nirvan-sutra',
    '/nirvan-shakti-snan-sadhna',
    '/spiritual-guidance',
    '/online-samvad',
    '/bodhgaya-samvad',
    '/guided-meditation',
    '/library',
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

  return [...staticRoutes, ...bookRoutes, ...magazineRoutes];
}
