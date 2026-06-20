# Nirvan Sutra Supabase Setup

1. Open Supabase Dashboard for `ihibxtyfhlhddxoeffjy` and run [course-progress.sql](../supabase/course-progress.sql) in **SQL Editor**.
2. In **Authentication -> URL Configuration**, set the Site URL to `https://nirvandham.in` and add these redirect URLs:
   - `https://nirvandham.in/auth/callback`
   - `http://localhost:3000/auth/callback`
3. In **Authentication -> Providers -> Google**, enable Google and add the Google OAuth client ID and secret. In Google Cloud, use the Supabase callback URL shown by that provider page as the authorized redirect URI.
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel for Production and Preview, then redeploy.

After the SQL trigger is active, every new Supabase account automatically gets a `user_progress` row. The SQL file ends with the admin dashboard query for reviewing learners and their current unlocked chapter.
# Final Test Add-On

After the original progress setup has been run, open Supabase SQL Editor and run `supabase/final-test-submissions.sql`.

Then add these Production and Preview environment variables in Vercel. Use a Gmail App Password, not the normal Gmail password:

```text
SMTP_USER=your-course-notifications@gmail.com
SMTP_APP_PASSWORD=your-16-character-google-app-password
ADMIN_EMAIL=where-you-want-final-test-alerts@example.com
```

The `course_admin_progress` view in Supabase Table Editor shows completion status. The linked `course_final_submissions` table stores the exact fifteen prompts and written answers.
