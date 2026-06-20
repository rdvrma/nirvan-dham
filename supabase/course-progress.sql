-- Run this once in Supabase Dashboard -> SQL Editor.

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default '',
  phone text,
  email text not null default '',
  highest_chapter_unlocked integer not null default 1 check (highest_chapter_unlocked between 1 and 9),
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

create policy "Learners can view their own progress"
on public.user_progress for select
to authenticated
using (auth.uid() = user_id);

create policy "Learners can update their own progress"
on public.user_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_user_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_progress_updated_at
before update on public.user_progress
for each row execute procedure public.set_user_progress_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_progress (user_id, name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.email, '')
  )
  on conflict (user_id) do update set
    name = excluded.name,
    phone = excluded.phone,
    email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.user_progress
  add column if not exists final_test_submitted_at timestamptz,
  add column if not exists shravana_completed_at timestamptz;

create table if not exists public.course_final_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  language text not null check (language in ('hi', 'en', 'hl')),
  name text not null,
  email text not null,
  phone text not null,
  answers jsonb not null,
  email_delivery_status text not null default 'pending' check (email_delivery_status in ('pending', 'sent', 'failed', 'not_configured')),
  email_delivery_error text,
  submitted_at timestamptz not null default now()
);

alter table public.course_final_submissions enable row level security;

create policy "Learners can view their own final submission"
on public.course_final_submissions for select
to authenticated
using (auth.uid() = user_id);

create policy "Learners can insert their own final submission"
on public.course_final_submissions for insert
to authenticated
with check (auth.uid() = user_id);

create or replace function public.update_final_submission_delivery_status(
  target_submission_id uuid,
  target_status text,
  target_error text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.course_final_submissions
  set
    email_delivery_status = target_status,
    email_delivery_error = target_error
  where id = target_submission_id
    and user_id = auth.uid();
end;
$$;

create or replace view public.course_admin_progress as
select
  progress.user_id,
  progress.name,
  progress.email,
  progress.phone,
  progress.highest_chapter_unlocked,
  progress.final_test_submitted_at,
  progress.shravana_completed_at,
  submission.id as final_submission_id,
  submission.language as final_submission_language,
  submission.submitted_at as final_submission_at,
  submission.email_delivery_status,
  submission.answers as final_submission_answers,
  progress.updated_at
from public.user_progress as progress
left join public.course_final_submissions as submission
  on submission.user_id = progress.user_id;

revoke all on public.course_admin_progress from anon, authenticated;

-- Supabase Dashboard -> Table Editor -> course_admin_progress shows each seeker.
-- Open course_final_submissions to inspect the complete question/answer JSON.

-- Admin dashboard query: progress is the next chapter the learner may open.
select
  name,
  email,
  phone,
  highest_chapter_unlocked,
  case
    when highest_chapter_unlocked >= 9 then 'Final Test'
    else 'Chapter ' || highest_chapter_unlocked::text
  end as current_course_position,
  updated_at
from public.user_progress
order by updated_at desc;
