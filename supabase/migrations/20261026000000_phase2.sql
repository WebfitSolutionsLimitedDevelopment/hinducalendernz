-- Phase 2: accounts, reminders, temple directory, sponsors, corrections, unsubscribe, rate limiting.
-- Principles: RLS on everywhere; the public API key can only read published content and
-- insert into submission tables; anything else goes through narrow SECURITY DEFINER functions
-- or the server-only secret key (reminder cron).

create schema if not exists private;
revoke all on schema private from anon, authenticated, public;

-- ---------- unsubscribe (launch list) ----------
alter table public.signups add column if not exists unsub_token uuid not null default gen_random_uuid();
create unique index if not exists signups_unsub_token_key on public.signups (unsub_token);

create or replace function public.unsubscribe_signup(p_token uuid) returns boolean
language sql security definer set search_path = '' as $$
  with u as (
    update public.signups set unsubscribed_at = coalesce(unsubscribed_at, now())
    where unsub_token = p_token returning 1
  ) select exists (select 1 from u)
$$;
revoke all on function public.unsubscribe_signup(uuid) from public;
grant execute on function public.unsubscribe_signup(uuid) to anon, authenticated;

-- ---------- rate limiting ----------
create table if not exists private.rate_hits (key text not null, at timestamptz not null default now());
create index if not exists rate_hits_key_at on private.rate_hits (key, at);

create or replace function public.rate_limit_ok(p_key text, p_max int, p_window_seconds int) returns boolean
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if p_key is null or length(p_key) > 200 or p_max < 1 or p_max > 100 or p_window_seconds < 1 or p_window_seconds > 86400 then
    return false;
  end if;
  delete from private.rate_hits where at < now() - interval '1 day';
  select count(*) into n from private.rate_hits
   where key = p_key and at > now() - make_interval(secs => p_window_seconds);
  if n >= p_max then return false; end if;
  insert into private.rate_hits (key) values (p_key);
  return true;
end $$;
revoke all on function public.rate_limit_ok(text, int, int) from public;
grant execute on function public.rate_limit_ok(text, int, int) to anon, authenticated;

-- ---------- user profiles (accounts) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  city text not null default 'auckland' check (city in ('auckland','hamilton','tauranga','wellington','palmerston-north','christchurch','dunedin')),
  tradition text not null default 'smarta' check (tradition in ('smarta', 'vaishnava')),
  remind_major boolean not null default true,
  remind_ekadashi boolean not null default false,
  remind_sankashti boolean not null default false,
  email_reminders boolean not null default false,
  days_before smallint not null default 1 check (days_before between 0 and 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, insert, update, delete on public.profiles to authenticated;
create policy "own profile: read" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "own profile: create" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "own profile: update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own profile: delete" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

-- ---------- push subscriptions (installable app reminders) ----------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique check (endpoint like 'https://%' and length(endpoint) < 1000),
  p256dh text not null check (length(p256dh) < 200),
  auth text not null check (length(auth) < 100),
  city text not null default 'auckland' check (city in ('auckland','hamilton','tauranga','wellington','palmerston-north','christchurch','dunedin')),
  tradition text not null default 'smarta' check (tradition in ('smarta', 'vaishnava')),
  remind_major boolean not null default true,
  remind_ekadashi boolean not null default false,
  remind_sankashti boolean not null default false,
  days_before smallint not null default 1 check (days_before between 0 and 7),
  user_id uuid references auth.users (id) on delete set null,
  failures int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;

create or replace function public.save_push_subscription(
  p_endpoint text, p_p256dh text, p_auth text, p_city text, p_tradition text,
  p_major boolean, p_ekadashi boolean, p_sankashti boolean, p_days_before int
) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.push_subscriptions as s
    (endpoint, p256dh, auth, city, tradition, remind_major, remind_ekadashi, remind_sankashti, days_before, user_id)
  values (p_endpoint, p_p256dh, p_auth, p_city, p_tradition, p_major, p_ekadashi, p_sankashti, p_days_before, auth.uid())
  on conflict (endpoint) do update set
    p256dh = excluded.p256dh, auth = excluded.auth, city = excluded.city, tradition = excluded.tradition,
    remind_major = excluded.remind_major, remind_ekadashi = excluded.remind_ekadashi,
    remind_sankashti = excluded.remind_sankashti, days_before = excluded.days_before,
    user_id = coalesce(excluded.user_id, s.user_id), failures = 0, updated_at = now();
  return true;
end $$;
revoke all on function public.save_push_subscription(text, text, text, text, text, boolean, boolean, boolean, int) from public;
grant execute on function public.save_push_subscription(text, text, text, text, text, boolean, boolean, boolean, int) to anon, authenticated;

create or replace function public.delete_push_subscription(p_endpoint text) returns boolean
language sql security definer set search_path = '' as $$
  with d as (delete from public.push_subscriptions where endpoint = p_endpoint returning 1)
  select exists (select 1 from d)
$$;
revoke all on function public.delete_push_subscription(text) from public;
grant execute on function public.delete_push_subscription(text) to anon, authenticated;

-- Sent-reminder log so the daily job never sends the same reminder twice. Server (secret key) only.
create table if not exists public.reminder_log (
  target text not null,          -- 'push:<id>' or 'email:<user id>'
  festival_key text not null,    -- '<city>|<date>|<festival id>'
  sent_at timestamptz not null default now(),
  primary key (target, festival_key)
);
alter table public.reminder_log enable row level security;
revoke all on public.reminder_log from anon, authenticated;

-- ---------- temple & community directory ----------
create table if not exists public.temples (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) <= 150),
  city text not null check (length(city) <= 60),
  address text check (length(address) <= 300),
  website text check (website is null or website ~ '^https?://'),
  phone text check (length(phone) <= 40),
  traditions text check (length(traditions) <= 200),
  description text check (length(description) <= 1000),
  kind text not null default 'temple' check (kind in ('temple', 'association', 'community')),
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  source text,
  verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.temples enable row level security;
revoke all on public.temples from anon, authenticated;
grant select on public.temples to anon, authenticated;
create policy "published temples are public" on public.temples for select to anon, authenticated using (status = 'published');

create table if not exists public.temple_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 150),
  city text not null check (length(city) between 2 and 60),
  address text check (length(address) <= 300),
  website text check (website is null or website ~ '^https?://'),
  phone text check (length(phone) <= 40),
  traditions text check (length(traditions) <= 200),
  notes text check (length(notes) <= 1000),
  submitter_email text check (submitter_email is null or submitter_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);
alter table public.temple_submissions enable row level security;
revoke all on public.temple_submissions from anon, authenticated;
grant insert (name, city, address, website, phone, traditions, notes, submitter_email) on public.temple_submissions to anon, authenticated;
create policy "anyone can suggest a temple" on public.temple_submissions for insert to anon, authenticated with check (true);

-- ---------- sponsors ----------
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null default 'community' check (tier in ('principal', 'festival', 'community')),
  website text check (website is null or website ~ '^https?://'),
  logo_url text,
  blurb text check (length(blurb) <= 300),
  festival_id text,                 -- optional: sponsor of a specific festival page
  starts_on date not null default current_date,
  ends_on date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);
alter table public.sponsors enable row level security;
revoke all on public.sponsors from anon, authenticated;
grant select on public.sponsors to anon, authenticated;
create policy "active sponsors are public" on public.sponsors for select to anon, authenticated
  using (status = 'published' and starts_on <= current_date and (ends_on is null or ends_on >= current_date));

create table if not exists public.sponsor_enquiries (
  id uuid primary key default gen_random_uuid(),
  business text not null check (length(business) between 2 and 150),
  contact_name text check (length(contact_name) <= 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (length(phone) <= 40),
  interest text check (length(interest) <= 1000),
  created_at timestamptz not null default now()
);
alter table public.sponsor_enquiries enable row level security;
revoke all on public.sponsor_enquiries from anon, authenticated;
grant insert (business, contact_name, email, phone, interest) on public.sponsor_enquiries to anon, authenticated;
create policy "anyone can enquire" on public.sponsor_enquiries for insert to anon, authenticated with check (true);

-- ---------- corrections / feedback ----------
create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(),
  city text check (length(city) <= 60),
  festival text check (length(festival) <= 150),
  expected text check (length(expected) <= 300),
  message text not null check (length(message) between 3 and 2000),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status text not null default 'new' check (status in ('new', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);
alter table public.corrections enable row level security;
revoke all on public.corrections from anon, authenticated;
grant insert (city, festival, expected, message, email) on public.corrections to anon, authenticated;
create policy "anyone can report a correction" on public.corrections for insert to anon, authenticated with check (true);
