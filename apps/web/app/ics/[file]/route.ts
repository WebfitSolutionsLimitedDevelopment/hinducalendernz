import { CITIES, YEARS, isCity, cityName, getFestivals } from '@/lib/data';
import { buildIcs } from '@/lib/ics';

// Subscribable calendar feeds: /ics/<city>.ics (major festivals) and /ics/<city>-all.ics (everything, incl. Ekadashi).
export const dynamicParams = false;
export const revalidate = 86400;
export const generateStaticParams = () => CITIES.flatMap((c) => [{ file: `${c.id}.ics` }, { file: `${c.id}-all.ics` }]);

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = file.match(/^([a-z-]+?)(-all)?\.ics$/);
  const city = m?.[1];
  if (!m || !isCity(city)) return new Response('Not found', { status: 404 });
  const all = !!m[2];
  const lists = await Promise.all(YEARS.map((y) => getFestivals(y, city)));
  const festivals = lists.flat().filter((f) => all || f.category === 'major');
  const site = process.env.SITE_URL ?? 'https://www.hinducalendar.co.nz';
  const body = buildIcs({ name: `Hindu festivals — ${cityName(city)}${all ? ' (all)' : ''}`, city, site, festivals });
  return new Response(body, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `inline; filename="hindu-calendar-${file}"`,
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
