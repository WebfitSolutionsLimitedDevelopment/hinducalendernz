import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { publicDb, adminDb } from '@/lib/supabase-server';
import { ecalManifest, ecalPdfPath, ECAL_PRICE_NZD } from '@/lib/ecalendar';

export const runtime = 'nodejs';
const BUCKET = 'ecalendar';

/**
 * Signed-in download of the clean (unwatermarked) e-calendar PDF.
 * The PDF ships inside this function; on first use it is copied to a private Supabase Storage bucket,
 * and each download gets a 10-minute signed link (keeps large files off the function response).
 */
export async function POST(req: Request) {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const pub = publicDb(), admin = adminDb();
  if (!pub || !admin) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  if (!token) return NextResponse.json({ error: 'signin' }, { status: 401 });
  const { data: u, error: ue } = await pub.auth.getUser(token);
  if (ue || !u.user) return NextResponse.json({ error: 'signin' }, { status: 401 });
  if (ECAL_PRICE_NZD > 0) return NextResponse.json({ error: 'payment' }, { status: 402 });

  const city = new URL(req.url).searchParams.get('city') ?? 'auckland';
  const m = ecalManifest(city);
  if (!m) return NextResponse.json({ error: 'notfound' }, { status: 404 });
  const object = `${m.generatedAt.replace(/[^0-9]/g, '').slice(0, 14)}/${m.pdf}`;

  let signed = await admin.storage.from(BUCKET).createSignedUrl(object, 600, { download: `Hindu-Calendar-NZ-${m.pdf}` });
  if (signed.error) {
    const file = ecalPdfPath(m.pdf);
    if (!file) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    await admin.storage.createBucket(BUCKET, { public: false }).catch(() => {});
    const up = await admin.storage.from(BUCKET).upload(object, readFileSync(file), { contentType: 'application/pdf', upsert: true });
    if (up.error) { console.error('ecalendar upload failed', up.error.message); return NextResponse.json({ error: 'storage' }, { status: 500 }); }
    signed = await admin.storage.from(BUCKET).createSignedUrl(object, 600, { download: `Hindu-Calendar-NZ-${m.pdf}` });
  }
  if (signed.error || !signed.data) return NextResponse.json({ error: 'storage' }, { status: 500 });
  return NextResponse.json({ url: signed.data.signedUrl });
}
