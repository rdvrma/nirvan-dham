-- Run once in Supabase SQL Editor before accepting Shakti Snan applications.
create table if not exists public.shakti_snan_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text not null,
  location text not null,
  preferred_language text not null check (preferred_language in ('Hindi', 'English', 'Hinglish')),
  answers jsonb not null,
  consent boolean not null default false check (consent = true),
  review_status text not null default 'pending' check (review_status in ('pending', 'reviewed', 'accepted', 'declined')),
  email_delivery_status text not null default 'not_configured' check (email_delivery_status in ('sent', 'failed', 'not_configured')),
  email_delivery_error text,
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz
);

alter table public.shakti_snan_applications enable row level security;

-- The public application form may create a record, but cannot read, edit or
-- delete any application. Full records remain visible in the Supabase dashboard.
create policy "Public may submit Shakti Snan applications"
on public.shakti_snan_applications
for insert
to anon, authenticated
with check (consent = true and review_status = 'pending');

create index if not exists shakti_snan_applications_submitted_at_idx
on public.shakti_snan_applications (submitted_at desc);

create index if not exists shakti_snan_applications_review_status_idx
on public.shakti_snan_applications (review_status);
