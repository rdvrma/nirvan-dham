# Privacy of reflection answers

During a video lesson the player stops and asks one or two reflection questions. The learner may write an answer. These answers are **personal and spiritual**. The design rule is: **an answer is visible only to the learner who wrote it.**

## What is stored, where
| data | where | who can read it |
|---|---|---|
| position in the lesson, which pause points are completed | `video_lesson_progress` (Supabase), mirrored in the browser (localStorage) | the learner (RLS); the browser copy: anyone using that browser |
| the learner's written answers (text, per lesson / pause point / question, at most 4,000 characters) | `video_lesson_answers` (Supabase) when signed in and the migration is applied; **otherwise only in this browser's localStorage** | the learner (RLS) |
| nothing about answers | analytics, logs, e-mail, the Guard Dog, any admin screen | no one |

Row level security (`supabase/video-lesson-progress.sql`): an authenticated user can select, insert, update and delete only rows with `user_id = auth.uid()`. `anon` and `public` have no privileges. There is no view, no function, no policy for any other role and no admin policy. The app code never uses the service-role key for these tables; the player only uses the learner's own session. The migration is **not applied**; until it is, answers stay in the learner's browser.

What the code does NOT do: it does not send answers anywhere except to the learner's own rows; it does not log them; the prompts' pipeline flags (`source`, `reviewed`...) are never shown to learners; "Ask the Guide" is a stub and receives no answers.

## What you must decide before going live
1. **Apply the migration, and when.** Review `supabase/video-lesson-progress.sql`, apply it in the Supabase SQL editor (nothing has been applied by this work). Test with two learner accounts that neither can read the other's rows.
2. **The promise on screen.** The panel tells learners "only you can see it". Technically the project owner (service-role key, SQL editor, database backups) *can* read the table; RLS cannot prevent that. Either commit never to read it (and keep every service-role use away from these tables), or change the sentence in `src/components/video-course/copy.ts`.
3. **Teacher or admin access: default none.** If a teacher should ever read answers, that needs a new, explicit, consented design (learner chooses to share, per answer); do not widen the RLS policies quietly.
4. **Retention and deletion.** Deleting a user's account deletes their rows (`on delete cascade`). Decide whether to offer "delete my answers" in the app (the policies already allow the learner to delete their own rows; there is no button yet), and how long backups keep them.
5. **The AI Guide.** If "Ask the Guide" later reads a learner's answers or sends them to a model provider, that is a new use of very personal text and needs the learner's clear consent each time; keep it off by default.
6. **Shared devices.** In the degraded mode (no table, or not signed in) answers sit in localStorage on that device. Decide whether to warn on shared phones or clear on sign-out.
7. **Legal basis and notice.** India's Digital Personal Data Protection Act applies to this kind of data; the privacy notice, consent wording, grievance contact and the rules for minors need your lawyer's review. This repository makes no legal claim.
8. **YouTube.** Lessons embedded from `youtube-nocookie.com` still contact Google when played; say so in the privacy notice. The page's own captions and answers are not sent to YouTube.
9. **Backups and exports.** Supabase backups contain the answers; decide who has access to backups and exports.
