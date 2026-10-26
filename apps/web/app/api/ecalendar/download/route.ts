import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { zipSync } from 'fflate';
import { publicDb, adminDb } from '@/lib/supabase-server';
import { ecalManifest, ecalPdfPath, ECAL_PRICE_NZD } from '@/lib/ecalendar';

export const runtime = 'nodejs';
export const maxDuration = 60;
const BUCKET = 'ecalendar';

/**
 * Signed-in downloads of the clean (unwatermarked) e-calendar:
 *   ?format=pdf            whole calendar, A4 PDF
 *   ?format=zip            every page as a high-resolution JPG, in one ZIP
 *   ?format=jpg&page=N     one page as a high-resolution JPG (2480 × 3508)
 * Files ship inside this function; on first request each is copied to a private Supabase Storage bucket
 * and the visitor gets a 10-minute signed link (keeps large files off the function response).
 */
export async function POST(req: Request) {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const pub = publicDb(), admin = adminDb();
  if (!pub || !admin) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  if (!token) return NextResponse.json({ error: 'signin' }, { status: 401 });
  const { data: u, error: ue } = await pub.auth.getUser(token);
  if (ue || !u.user) return NextResponse.json({ error: 'signin' }, { status: 401 });
  if (ECAL_PRICE_NZD > 0) return NextResponse.json({ error: 'payment' }, { status: 402 });

  const q = new URL(req.url).searchParams;
  const city = q.get('city') ?? 'auckland';
  const format = q.get('format') ?? 'pdf';
  const m = ecalManifest(city);
  if (!m) return NextResponse.json({ error: 'notfound' }, { status: 404 });
  const version = m.generatedAt.replace(/[^0-9]/g, '').slice(0, 14);

  // Work out which file is wanted and how to build it.
  let name: string, type: string, build: () => Uint8Array | null;
  if (format === 'pdf') {
    name = m.pdf; type = 'application/pdf';
    build = () => { const f = ecalPdfPath(m.pdf); return f ? readFileSync(f) : null; };
  } else if (format === 'jpg') {
    const page = m.pages[Number(q.get('page'))];
    if (!page?.hd || !m.jpgDir) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    name = page.hd; type = 'image/jpeg';
    build = () => { const f = ecalPdfPath(`${m.jpgDir}/${page.hd}`); return f ? readFileSync(f) : null; };
  } else if (format === 'zip') {
    if (!m.jpgDir) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    name = m.pdf.replace(/\.pdf$/, '-jpg.zip'); type = 'application/zip';
    build = () => {
      const files: Record<string, [Uint8Array, { level: 0 }]> = {};
      for (const p of m.pages) {
        const f = p.hd ? ecalPdfPath(`${m.jpgDir}/${p.hd}`) : null;
        if (f) files[p.hd!] = [readFileSync(f), { level: 0 }]; // JPGs are already compressed
      }
      return Object.keys(files).length ? zipSync(files) : null;
    };
  } else {
    return NextResponse.json({ error: 'format' }, { status: 400 });
  }

  const object = `${version}/${format}/${name}`;
  const dl = { download: `Hindu-Calendar-NZ-${name}` };
  let signed = await admin.storage.from(BUCKET).createSignedUrl(object, 600, dl);
  if (signed.error) {
    const bytes = build();
    if (!bytes) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    await admin.storage.createBucket(BUCKET, { public: false }).catch(() => {});
    const up = await admin.storage.from(BUCKET).upload(object, bytes, { contentType: type, upsert: true });
    if (up.error) { console.error('ecalendar upload failed', up.error.message); return NextResponse.json({ error: 'storage' }, { status: 500 }); }
    signed = await admin.storage.from(BUCKET).createSignedUrl(object, 600, dl);
  }
  if (signed.error || !signed.data) return NextResponse.json({ error: 'storage' }, { status: 500 });
  return NextResponse.json({ url: signed.data.signedUrl });
}
