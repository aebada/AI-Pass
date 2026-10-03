import type { MetadataRoute } from 'next';

const BASE = 'https://aipass.space';

export default function sitemap(): MetadataRoute.Sitemap {
  const research = [
    '',
    '/route',
    '/ground',
    '/assure',
    '/foundation',
    '/physical',
    '/roadmap',
    '/evidence',
  ].map((path) => ({
    url: `${BASE}/research${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 0.8 : 0.6,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/demo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...research,
  ];
}
