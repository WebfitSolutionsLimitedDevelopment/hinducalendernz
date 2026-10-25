import { NextResponse } from 'next/server';

// Phase 1: forwards sign-ups to SIGNUP_WEBHOOK_URL (e.g. a form service or Google Apps Script).
// Phase 2: replace with a database insert (signups table) — the form does not need to change.
export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get('email') ?? '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
  }
  const entry = {
    email,
    name: String(form.get('name') ?? '').slice(0, 120),
    city: String(form.get('city') ?? ''),
    interestPrint: form.has('interest_print'),
    interestApp: form.has('interest_app'),
    createdAt: new Date().toISOString(),
  };
  const hook = process.env.SIGNUP_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ ok: false, error: 'Sign-ups are not open yet.' }, { status: 503 });
  const r = await fetch(hook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(entry) });
  if (!r.ok) return NextResponse.json({ ok: false, error: 'Could not save your sign-up. Please try again.' }, { status: 502 });
  return NextResponse.redirect(new URL('/contact?thanks=1', req.url), 303);
}
