-- Nirvan Sutra v2 (the 17-stage journey, /nirvan-sutra/yatra).
-- Run once in Supabase Dashboard -> SQL Editor AFTER the owner approves it (it only ADDS ns_* objects; nothing existing is changed).
-- Locally: scripts/nirvan-sutra/local-supabase.sh applies it to a Docker Supabase.

-- One row per learner: the whole progress document (same shape as src/course/nirvan-sutra/types.ts Progress).
create table if not exists public.ns_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null,
  locale text,
  stages_completed integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Guides (teachers) of the Nididhyasana phase. Added by the owner in SQL: insert into public.ns_guides (user_id) select id from auth.users where email = '...';
create table if not exists public.ns_guides (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

-- The weekly guided session for each of the 12 weeks (same for every learner in that week).
create table if not exists public.ns_guide_weeks (
  week integer primary key check (week between 1 and 12),
  live_session_url text,
  recording_url text,
  session_note text,
  updated_at timestamptz not null default now()
);

-- A guide's note to one learner for one week (answers to doubts, encouragement).
create table if not exists public.ns_guide_notes (
  learner_id uuid not null references auth.users(id) on delete cascade,
  week integer not null check (week between 1 and 12),
  note text not null,
  guide_id uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (learner_id, week)
);

create or replace function public.ns_is_guide()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.ns_guides where user_id = auth.uid()); $$;

alter table public.ns_progress enable row level security;
alter table public.ns_guides enable row level security;
alter table public.ns_guide_weeks enable row level security;
alter table public.ns_guide_notes enable row level security;

drop policy if exists "ns learner reads own progress" on public.ns_progress;
create policy "ns learner reads own progress" on public.ns_progress for select to authenticated using (auth.uid() = user_id or public.ns_is_guide());
drop policy if exists "ns learner inserts own progress" on public.ns_progress;
create policy "ns learner inserts own progress" on public.ns_progress for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "ns learner updates own progress" on public.ns_progress;
create policy "ns learner updates own progress" on public.ns_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ns guides see guides" on public.ns_guides;
create policy "ns guides see guides" on public.ns_guides for select to authenticated using (auth.uid() = user_id or public.ns_is_guide());

drop policy if exists "ns weeks readable" on public.ns_guide_weeks;
create policy "ns weeks readable" on public.ns_guide_weeks for select to authenticated using (true);
drop policy if exists "ns weeks guide write" on public.ns_guide_weeks;
create policy "ns weeks guide write" on public.ns_guide_weeks for all to authenticated using (public.ns_is_guide()) with check (public.ns_is_guide());

drop policy if exists "ns notes learner or guide read" on public.ns_guide_notes;
create policy "ns notes learner or guide read" on public.ns_guide_notes for select to authenticated using (auth.uid() = learner_id or public.ns_is_guide());
drop policy if exists "ns notes guide write" on public.ns_guide_notes;
create policy "ns notes guide write" on public.ns_guide_notes for all to authenticated using (public.ns_is_guide()) with check (public.ns_is_guide());

create or replace function public.ns_touch_updated_at()
returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists ns_progress_touch on public.ns_progress;
create trigger ns_progress_touch before update on public.ns_progress for each row execute procedure public.ns_touch_updated_at();
drop trigger if exists ns_weeks_touch on public.ns_guide_weeks;
create trigger ns_weeks_touch before update on public.ns_guide_weeks for each row execute procedure public.ns_touch_updated_at();
drop trigger if exists ns_notes_touch on public.ns_guide_notes;
create trigger ns_notes_touch before update on public.ns_guide_notes for each row execute procedure public.ns_touch_updated_at();

-- Admin view (Table Editor): who is where.
create or replace view public.ns_admin_progress with (security_invoker = true) as
select p.user_id, u.email, p.locale, p.stages_completed, p.progress -> 'nididhyasana' ->> 'startedAt' as nididhyasana_started,
       p.progress -> 'finalReflection' ->> 'submittedAt' as final_reflection_at, p.updated_at
from public.ns_progress p join auth.users u on u.id = p.user_id;
-- Only the owner (dashboard / service role) reads the admin view; it is not exposed to app users.
revoke all on public.ns_admin_progress from anon, authenticated;
