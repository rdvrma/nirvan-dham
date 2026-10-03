-- Video lessons: progress and reflection answers.
-- NOT APPLIED by anyone yet. Run once in Supabase Dashboard -> SQL Editor (same convention as supabase/course-progress.sql) after you have read docs/video-course/privacy.md.
-- Until it is applied the player keeps progress and answers in the browser (localStorage) and everything else works.
--
-- Privacy rule this file enforces: a learner's reflection answers are personal and spiritual. Row level security lets an authenticated user read and write ONLY their own
-- rows. There is no view, no function, no policy for any other role, and nothing here grants admin or analytics access. Note: Supabase's service-role key bypasses RLS by design;
-- the app never uses it for these tables and nothing may be added that does (see privacy.md).

create table if not exists public.video_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  position_sec numeric not null default 0 check (position_sec >= 0),
  completed_pause_ids text[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.video_lesson_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  pause_id text not null,
  segment_id text not null default '',
  prompt_index integer not null check (prompt_index >= 0),
  prompt_text text not null default '',
  answer text not null check (char_length(answer) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id, pause_id, prompt_index)
);

alter table public.video_lesson_progress enable row level security;
alter table public.video_lesson_answers enable row level security;

-- nobody but the signed-in learner: remove every default privilege first, then grant exactly what is needed
revoke all on public.video_lesson_progress from public, anon;
revoke all on public.video_lesson_answers from public, anon;
grant select, insert, update, delete on public.video_lesson_progress to authenticated;
grant select, insert, update, delete on public.video_lesson_answers to authenticated;

create policy "Learners read their own video progress"
on public.video_lesson_progress for select to authenticated
using (auth.uid() = user_id);

create policy "Learners write their own video progress"
on public.video_lesson_progress for insert to authenticated
with check (auth.uid() = user_id);

create policy "Learners update their own video progress"
on public.video_lesson_progress for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Learners delete their own video progress"
on public.video_lesson_progress for delete to authenticated
using (auth.uid() = user_id);

create policy "Learners read their own reflection answers"
on public.video_lesson_answers for select to authenticated
using (auth.uid() = user_id);

create policy "Learners write their own reflection answers"
on public.video_lesson_answers for insert to authenticated
with check (auth.uid() = user_id);

create policy "Learners update their own reflection answers"
on public.video_lesson_answers for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Learners delete their own reflection answers"
on public.video_lesson_answers for delete to authenticated
using (auth.uid() = user_id);

create or replace function public.set_video_lesson_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_video_lesson_progress_updated_at
before update on public.video_lesson_progress
for each row execute procedure public.set_video_lesson_updated_at();

create trigger set_video_lesson_answers_updated_at
before update on public.video_lesson_answers
for each row execute procedure public.set_video_lesson_updated_at();

comment on table public.video_lesson_answers is 'Personal reflection answers of a learner. Visible only to that learner (RLS). Do not add admin or analytics access.';
