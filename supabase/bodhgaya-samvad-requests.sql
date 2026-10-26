-- Bodhgaya Samvad applications. Apply in the Nirvan Dham Supabase project.
-- Public clients can submit a NEW request, but cannot read or change any request.
create extension if not exists pgcrypto;

create table if not exists public.bodhgaya_samvad_requests (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null,
  phone text not null,
  country text not null,
  preferred_language text not null check (preferred_language in ('English','Hindi')),
  page_language text not null check (page_language in ('en','hi')),
  travel_dates text not null,
  meeting_type text not null check (meeting_type in ('individual','couple','small_group')),
  primary_question text check (char_length(primary_question) between 30 and 2000),
  why_in_person text check (char_length(why_in_person) between 20 and 2000),
  note text,
  contact_consent boolean not null check (contact_consent),
  request_consent boolean not null check (request_consent),
  contribution_consent boolean not null check (contribution_consent),
  status text not null default 'NEW' check (status in ('NEW','REVIEWING','ACCEPTED','DECLINED','CONFIRMED','COMPLETED','CANCELLED')),
  internal_note text,
  requested_slot_text text,
  agreed_slot timestamptz,
  booking_token uuid not null default gen_random_uuid() unique,
  payment_status text not null default 'NOT_STARTED' check (payment_status in ('NOT_STARTED','PENDING','PAID','FAILED','REFUNDED')),
  payment_reference text unique,
  payment_link_id text unique,
  payment_url text,
  formspree_notified_at timestamptz,
  payment_amount_paise integer,
  payment_verified_at timestamptz,
  confirmed_at timestamptz
);

alter table public.bodhgaya_samvad_requests
  add column if not exists requested_slot_text text;
alter table public.bodhgaya_samvad_requests
  add column if not exists payment_link_id text;
alter table public.bodhgaya_samvad_requests
  add column if not exists payment_url text;
alter table public.bodhgaya_samvad_requests
  add column if not exists formspree_notified_at timestamptz;
alter table public.bodhgaya_samvad_requests
  alter column primary_question drop not null,
  alter column why_in_person drop not null;
create unique index if not exists bodhgaya_samvad_payment_link_unique
  on public.bodhgaya_samvad_requests (payment_link_id) where payment_link_id is not null;
-- A submitted request reserves its two-hour start immediately, even while unpaid.
-- Declined/cancelled requests release it. This index is the concurrency boundary.
create unique index if not exists bodhgaya_samvad_reserved_slot_unique
  on public.bodhgaya_samvad_requests (agreed_slot)
  where agreed_slot is not null and status not in ('DECLINED', 'CANCELLED');

create index if not exists bodhgaya_samvad_requests_created_idx
  on public.bodhgaya_samvad_requests (created_at desc);
create index if not exists bodhgaya_samvad_requests_status_idx
  on public.bodhgaya_samvad_requests (status, created_at desc);

alter table public.bodhgaya_samvad_requests enable row level security;
revoke all on public.bodhgaya_samvad_requests from anon, authenticated;
grant insert (
  id, name, email, phone, country, preferred_language, page_language,
  travel_dates, meeting_type, primary_question, why_in_person, note,
  contact_consent, request_consent, contribution_consent
) on public.bodhgaya_samvad_requests to anon, authenticated;

drop policy if exists "Public may submit new Samvad requests" on public.bodhgaya_samvad_requests;
create policy "Public may submit new Samvad requests"
on public.bodhgaya_samvad_requests for insert to anon, authenticated
with check (
  status = 'NEW' and internal_note is null and agreed_slot is null
  and payment_status = 'NOT_STARTED' and payment_reference is null
  and payment_amount_paise is null and payment_verified_at is null
  and confirmed_at is null
);

-- The Supabase dashboard (service role) is the initial private review workspace.
-- A public read/update policy must not be added for this table.
