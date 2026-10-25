import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { rateLimitOk } from '@/lib/supabase-server';

// Sends one test notification to the subscription the browser passes in.
export async function POST(req: Request) {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return NextResponse.json({ ok: false }, { status: 503 });
  if (!(await rateLimitOk(req, 'pushtest', 5, 3600))) return NextResponse.json({ ok: false }, { status: 429 });
  const sub = await req.json().catch(() => null);
  if (!sub?.endpoint || !/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) return NextResponse.json({ ok: false }, { status: 400 });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:info@webfitt.co.nz', pub, priv);
  try {
    await webpush.sendNotification(sub, JSON.stringify({ title: 'Hindu Calendar NZ', body: 'Reminders are working. We’ll let you know before your chosen festivals.', url: '/festivals' }), { TTL: 600 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
