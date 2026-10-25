import { NextResponse } from 'next/server';
import { publicDb, rateLimitOk, str, isEmail } from '@/lib/supabase-server';

// Launch-list sign-ups → Supabase `signups` (insert-only for the public key; nobody can read via API).
export async function POST(req: Request) {
  const form = await req.formData();
  const back = (q: string) => NextResponse.redirect(new URL(`/contact?${q}#signup`, req.url), 303);
  if (form.get('website')) return back('thanks=1'); // honeypot
  const email = str(form.get('email'), 254)?.toLowerCase() ?? null;
  if (!isEmail(email)) return back('error=email');
  if (!(await rateLimitOk(req, 'signup', 5, 3600))) return back('error=rate');
  const db = publicDb();
  if (!db) return back('error=closed');
  const { error } = await db.from('signups').insert({
    email,
    name: str(form.get('name'), 120),
    city: str(form.get('city'), 60),
    interest_print: form.has('interest_print'),
    interest_app: form.has('interest_app'),
  });
  if (error && error.code !== '23505') { // 23505 = already on the list
    console.error('signup insert failed', error.message);
    return back('error=save');
  }
  return back('thanks=1');
}
