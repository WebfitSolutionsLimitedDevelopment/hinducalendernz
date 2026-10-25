import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Launch-list sign-ups → Supabase table `signups` (see supabase/migrations).
// Uses the publishable key from server code only (never sent to browsers).
// RLS allows INSERT only; nobody can read sign-ups through the API.
export async function POST(req: Request) {
  const form = await req.formData();
  const back = (q: string) => NextResponse.redirect(new URL(`/contact?${q}`, req.url), 303);

  if (String(form.get('website') ?? '') !== '') return back('thanks=1'); // honeypot: silently drop bots

  const email = String(form.get('email') ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return back('error=email');

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return back('error=closed');

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await db.from('signups').insert(
    {
      email,
      name: String(form.get('name') ?? '').trim().slice(0, 120) || null,
      city: String(form.get('city') ?? '').slice(0, 60) || null,
      interest_print: form.has('interest_print'),
      interest_app: form.has('interest_app'),
    },
  );
  if (error && error.code !== '23505') { // 23505 = already signed up → treat as success
    console.error('signup insert failed', error.message);
    return back('error=save');
  }
  return back('thanks=1');
}
