import { NextResponse } from 'next/server';
import { publicDb, rateLimitOk, str, isEmail, isUrl } from '@/lib/supabase-server';
import { notifyTeam } from '@/lib/notify';

// Temple suggestions go to a moderation queue (temple_submissions); nothing is published automatically.
export async function POST(req: Request) {
  const form = await req.formData();
  const back = (q: string) => NextResponse.redirect(new URL(`/temples?${q}#suggest`, req.url), 303);
  if (form.get('website_confirm')) return back('thanks=1'); // honeypot
  const name = str(form.get('name'), 150), city = str(form.get('city'), 60);
  const website = str(form.get('website'), 300), email = str(form.get('submitter_email'), 254);
  if (!name || name.length < 2 || !city) return back('error=missing');
  if (!isUrl(website) || (email && !isEmail(email))) return back('error=invalid');
  if (!(await rateLimitOk(req, 'temple', 5, 3600))) return back('error=rate');
  const db = publicDb();
  if (!db) return back('error=closed');
  const { error } = await db.from('temple_submissions').insert({
    name, city, website, submitter_email: email?.toLowerCase() ?? null,
    address: str(form.get('address'), 300), phone: str(form.get('phone'), 40),
    traditions: str(form.get('traditions'), 200), notes: str(form.get('notes'), 1000),
  });
  if (error) { console.error('temple submission failed', error.message); return back('error=save'); }
  await notifyTeam(`Temple listing: ${name} (${city})`, { name, city, website, email, address: form.get('address'), phone: form.get('phone'), traditions: form.get('traditions'), notes: form.get('notes'), review: 'Supabase → temple_submissions' });
  return back('thanks=1');
}
