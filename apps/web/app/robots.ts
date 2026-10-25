import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL ?? 'https://hinducalendar.co.nz';
  if (process.env.DATA_MODE === 'preview' || process.env.PREVIEW_PASSWORD) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/account', '/unsubscribe'] }, sitemap: `${base}/sitemap.xml` };
}
