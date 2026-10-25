import type { MetadataRoute } from 'next';
import { CITIES, YEARS } from '@/lib/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? 'https://hinducalendar.co.nz';
  const pages = ['', '/temples', '/reminders', '/how-hindu-dates-work', '/how-to-use', '/corrections', '/about', '/sponsors', '/contact', '/privacy', '/terms'];
  const out: MetadataRoute.Sitemap = pages.map((p) => ({ url: `${base}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.5 }));
  for (const c of CITIES) for (const y of YEARS) {
    out.push({ url: `${base}/festivals/${c.id}/${y}`, changeFrequency: 'weekly', priority: 0.8 });
    for (let m = 1; m <= 12; m++) out.push({ url: `${base}/calendar/${c.id}/${y}/${m}`, changeFrequency: 'monthly', priority: 0.6 });
  }
  return out;
}
