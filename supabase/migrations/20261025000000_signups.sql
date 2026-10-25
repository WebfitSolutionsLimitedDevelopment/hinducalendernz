-- Launch-list sign-ups. Written only by the website's server (secret key);
-- RLS on with no public policies, so browsers/anon keys can neither read nor write.
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
  constraint signups_email_lower check (email = lower(email)),
  constraint signups_email_unique unique (email)
);
alter table public.signups enable row level security;
revoke all on public.signups from anon, authenticated;
comment on table public.signups is 'Hindu Calendar NZ launch list. Personal information — NZ Privacy Act 2020. Venture data.';
