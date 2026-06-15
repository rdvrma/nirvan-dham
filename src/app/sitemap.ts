import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nirvandham.in';
  
  // Base static routes
  const routes = [
    '',
    '/about-aadisatv',
    '/nirvan-sutra',
    '/spiritual-guidance',
    '/online-samvad',
    '/bodhgaya-samvad',
    '/guided-meditation',
    '/faq',
    '/donation',
    '/blog',
    '/ichchha-poorti'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
