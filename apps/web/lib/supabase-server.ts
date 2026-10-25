import 'server-only';
import { createHash } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Server client with the publishable key: same rights as the public (RLS-limited). */
export function publicDb(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

/** Server client with the secret key: bypasses RLS. Only for the reminder job. */
export function adminDb(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

/** Returns false when this visitor has hit `max` submissions of `kind` within `windowSeconds`. */
export async function rateLimitOk(req: Request, kind: string, max: number, windowSeconds: number) {
  const db = publicDb();
  if (!db) return true;
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const key = `${kind}:${createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT ?? 'hcnz')).digest('hex').slice(0, 32)}`;
  const { data, error } = await db.rpc('rate_limit_ok', { p_key: key, p_max: max, p_window_seconds: windowSeconds });
  return error ? true : data === true; // fail open if the limiter itself errors
}

export const str = (v: FormDataEntryValue | null, max: number) => {
  const s = String(v ?? '').trim().slice(0, max);
  return s === '' ? null : s;
};
export const isEmail = (s: string | null) => !!s && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) && s.length <= 254;
export const isUrl = (s: string | null) => !s || /^https?:\/\/\S+$/.test(s);
