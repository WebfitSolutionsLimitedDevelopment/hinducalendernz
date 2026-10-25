import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { adminDb } from '@/lib/supabase-server';
import { getFestivals, todayNZ, addDaysISO, cityName, fmtDate, fmtTime, isYear, type Festival } from '@/lib/data';

// Daily reminder job (Vercel Cron, see vercel.json). Sends web-push to devices and, if
// RESEND_API_KEY is set, emails to account holders who opted in. Each reminder is logged
// in reminder_log so a re-run never sends duplicates.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Target = {
  key: string; city: string; tradition: string; days_before: number;
  remind_major: boolean; remind_ekadashi: boolean; remind_sankashti: boolean;
  push?: { id: string; endpoint: string; p256dh: string; auth: string }; email?: string;
};

function wanted(f: Festival, t: Target) {
  return (f.category === 'major' && t.remind_major) || (f.category === 'ekadashi' && t.remind_ekadashi) || (f.category === 'monthly' && t.remind_sankashti);
}

/** Observance date for this person's tradition (Vaishnava Ekadashi can be a day later). */
const dateFor = (f: Festival, t: Target) => (t.tradition === 'vaishnava' && f.timing.vaishnavaDate) || f.date;

function message(f: Festival, t: Target, today: string) {
  const d = dateFor(f, t);
  const when = d === today ? 'today' : d === addDaysISO(today, 1) ? 'tomorrow' : `on ${fmtDate(d, { weekday: true, short: true })}`;
  const tm = f.timing;
  let detail = '';
  if (tm.windowStart) detail = ` — ${fmtTime(tm.windowStart)} to ${fmtTime(tm.windowEnd)} in ${cityName(t.city)}`;
  else if (tm.moonrise) detail = ` — moonrise ${fmtTime(tm.moonrise)} in ${cityName(t.city)}`;
  else if (tm.paranaStart && t.tradition !== 'vaishnava') detail = ` — break the fast next morning ${fmtTime(tm.paranaStart)}–${fmtTime(tm.paranaEnd)}`;
  return {
    title: `${f.name} ${when}`,
    body: `${f.name} is ${when}, ${fmtDate(d, { weekday: true, short: true })}${detail}.`,
    url: `/festivals/${t.city}/${d.slice(0, 4)}/${f.slug}`,
  };
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new NextResponse('Unauthorized', { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: 'SUPABASE_SECRET_KEY not set' }, { status: 503 });

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (pub && priv) webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:hello@hinducalendar.co.nz', pub, priv);
  const resendKey = process.env.RESEND_API_KEY, from = process.env.REMINDER_FROM_EMAIL;
  const site = process.env.SITE_URL ?? 'https://hinducalendar.co.nz';

  // Gather targets
  const targets: Target[] = [];
  if (pub && priv) {
    const { data } = await db.from('push_subscriptions').select('*').lt('failures', 5);
    for (const s of data ?? []) targets.push({ ...s, key: `push:${s.id}`, push: s });
  }
  if (resendKey && from) {
    const { data: profiles } = await db.from('profiles').select('*').eq('email_reminders', true);
    for (const p of profiles ?? []) {
      const { data: u } = await db.auth.admin.getUserById(p.id);
      if (u?.user?.email) targets.push({ ...p, key: `email:${p.id}`, email: u.user.email });
    }
  }

  const today = todayNZ();
  const festCache = new Map<string, Festival[]>();
  const festivalsOn = async (city: string, date: string) => {
    const y = Number(date.slice(0, 4));
    if (!isYear(y)) return [];
    const k = `${city}|${y}`;
    if (!festCache.has(k)) festCache.set(k, await getFestivals(y, city));
    return festCache.get(k)!;
  };

  let sent = 0, failed = 0, skipped = 0;
  for (const t of targets) {
    const target = addDaysISO(today, t.days_before);
    // Search the target year and the next one (Vaishnava dates can roll over a year end).
    const list = (await festivalsOn(t.city, target)).filter((f) => wanted(f, t) && dateFor(f, t) === target);
    for (const f of list) {
      const festivalKey = `${t.city}|${dateFor(f, t)}|${f.slug}`;
      const { error: dup } = await db.from('reminder_log').insert({ target: t.key, festival_key: festivalKey });
      if (dup) { skipped++; continue; } // already sent (primary key conflict)
      const msg = message(f, t, today);
      try {
        if (t.push) {
          await webpush.sendNotification({ endpoint: t.push.endpoint, keys: { p256dh: t.push.p256dh, auth: t.push.auth } }, JSON.stringify(msg), { TTL: 60 * 60 * 12 });
        } else if (t.email) {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { authorization: `Bearer ${resendKey}`, 'content-type': 'application/json' },
            body: JSON.stringify({
              from, to: t.email, subject: msg.title,
              text: `${msg.body}\n\nDetails: ${site}${msg.url}\n\nChange or stop reminders: ${site}/account`,
              headers: { 'List-Unsubscribe': `<${site}/account>` },
            }),
          });
          if (!r.ok) throw Object.assign(new Error(`resend ${r.status}`), { statusCode: r.status });
        }
        sent++;
      } catch (e) {
        failed++;
        await db.from('reminder_log').delete().match({ target: t.key, festival_key: festivalKey }); // allow retry
        const code = (e as { statusCode?: number }).statusCode;
        if (t.push) {
          if (code === 404 || code === 410) await db.from('push_subscriptions').delete().eq('id', t.push.id); // device unsubscribed
          else await db.from('push_subscriptions').update({ failures: ((t as unknown as { failures?: number }).failures ?? 0) + 1 }).eq('id', t.push.id);
        }
      }
    }
  }
  return NextResponse.json({ ok: true, date: today, targets: targets.length, sent, failed, skipped });
}
