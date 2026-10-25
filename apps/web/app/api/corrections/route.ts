import { NextResponse } from 'next/server';
import { publicDb, rateLimitOk, str, isEmail } from '@/lib/supabase-server';
import { notifyTeam, confirmToSender } from '@/lib/notify';

export async function POST(req: Request) {
  const form = await req.formData();
  const back = (q: string) => NextResponse.redirect(new URL(`/corrections?${q}#report`, req.url), 303);
  if (form.get('website')) return back('thanks=1'); // honeypot
  const message = str(form.get('message'), 2000), email = str(form.get('email'), 254)?.toLowerCase() ?? null;
  if (!message || message.length < 3) return back('error=missing');
  if (email && !isEmail(email)) return back('error=email');
  if (!(await rateLimitOk(req, 'correction', 10, 3600))) return back('error=rate');
  const db = publicDb();
  if (!db) return back('error=closed');
  const { error } = await db.from('corrections').insert({
    message, email, city: str(form.get('city'), 60), festival: str(form.get('festival'), 150), expected: str(form.get('expected'), 300),
  });
  if (error) { console.error('correction failed', error.message); return back('error=save'); }
  if (email) await confirmToSender('correction', email, { subject: str(form.get('festival'), 150) });
  await notifyTeam('Correction reported', { city: form.get('city'), festival: form.get('festival'), expected: form.get('expected'), message, email });
  return back('thanks=1');
}
