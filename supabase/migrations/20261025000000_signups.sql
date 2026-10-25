-- Launch-list sign-ups. Personal information: nobody can read rows through the API;
-- only the dashboard / service role can. See insert-only policy at the end.
create table if not exists public.signups (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text,
  city          text,
  interest_print boolean not null default false,
  interest_app   boolean not null default false,
  consent       boolean not null default true,
  source        text not null default 'website',
  created_at    timestamptz not null default now(),
  unsubscribed_at timestamptz,
  constraint signups_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint signups_name_len check (name is null or char_length(name) <= 120),
  constraint signups_city_len check (city is null or char_length(city) <= 60),
  constraint signups_email_lower check (email = lower(email)),
  constraint signups_email_unique unique (email)
);
alter table public.signups enable row level security;
revoke all on public.signups from anon, authenticated;
comment on table public.signups is 'Hindu Calendar NZ launch list. Personal information — NZ Privacy Act 2020. Venture data.';

-- The website server inserts with the publishable (anon) key, which is never sent to browsers.
-- anon may INSERT only (no SELECT/UPDATE/DELETE), and only plain website sign-ups.
grant insert (email, name, city, interest_print, interest_app) on public.signups to anon;
create policy "website can add sign-ups"
  on public.signups for insert to anon
  with check (consent = true and source = 'website' and unsubscribed_at is null);
