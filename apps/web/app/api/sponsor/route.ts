import { NextResponse } from 'next/server';
import { publicDb, rateLimitOk, str, isEmail } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const form = await req.formData();
  const back = (q: string) => NextResponse.redirect(new URL(`/sponsors?${q}#enquire`, req.url), 303);
  if (form.get('website_confirm')) return back('thanks=1'); // honeypot
  const business = str(form.get('business'), 150), email = str(form.get('email'), 254)?.toLowerCase() ?? null;
  if (!business || business.length < 2) return back('error=missing');
  if (!isEmail(email)) return back('error=email');
  if (!(await rateLimitOk(req, 'sponsor', 5, 3600))) return back('error=rate');
  const db = publicDb();
  if (!db) return back('error=closed');
  const { error } = await db.from('sponsor_enquiries').insert({
    business, email, contact_name: str(form.get('contact_name'), 120),
    phone: str(form.get('phone'), 40), interest: str(form.get('interest'), 1000),
  });
  if (error) { console.error('sponsor enquiry failed', error.message); return back('error=save'); }
  return back('thanks=1');
}
