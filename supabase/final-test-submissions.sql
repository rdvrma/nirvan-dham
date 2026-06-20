-- Run this after supabase/course-progress.sql if user_progress already exists.

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
  set email_delivery_status = target_status, email_delivery_error = target_error
  where id = target_submission_id and user_id = auth.uid();
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

-- In Supabase Table Editor, open course_admin_progress for completion status.
-- Open course_final_submissions for the complete answer JSON.
