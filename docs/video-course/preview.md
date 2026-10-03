# Preview deployment and phone testing

The branch `video-course` builds as an ordinary Next.js (standalone) build. Nothing is deployed from the work session except by `git push`; if the Vercel project is connected to the repository, every push to the branch gets a Preview deployment.

## Environment variables for the PREVIEW environment only (not Production)
| variable | value | when it is read | meaning |
|---|---|---|---|
| `NEXT_PUBLIC_VIDEO_COURSE` | `1` | **build time** (it is inlined into the bundles: set it before the build, redeploy after changing it) | turns the video-lesson experience on. Unset or anything else: the site is exactly as before. |
| `VIDEO_COURSE_PUBLIC_PREVIEW` | `1` | run time, server only | opens `/video-preview/<chapter>` without sign-in (progress and answers stay on the device). Without it that URL is a 404. **Never set it in Production.** |
| `NEXT_PUBLIC_VIDEO_COURSE_ENGLISH` | `1` (optional) | build time | shows the English audio/captions choice. It is an unreviewed machine translation: only for your own checking. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | already set for the site | build time | the existing Supabase client, used only for sign-in and (after the migration) the two video tables. |

Not needed: `VIDEO_BASE_URL`, any R2 or CDN variable (dropped by the YouTube-first decision). In Vercel: Project -> Settings -> Environment Variables -> add each variable and tick **Preview** only.

## Testing on a phone
1. Open `https://<preview-url>/video-preview/1` (no sign-in; Hindi). The local 540p proxy plays. `?lang=en` only has an effect when English is enabled (`NEXT_PUBLIC_VIDEO_COURSE_ENGLISH=1`): then the page, audio and captions start in English.
2. To try a real YouTube upload before its id is in the code: `https://<preview-url>/video-preview/1?yt=<11-character id>`. Native YouTube controls stay on; the captions are drawn by the page, clear of YouTube's control bar.
3. Tap play (phones do not autoplay with sound). At about 0:51 the video pauses and the reflection panel opens **below** the player. Type an answer or wait 10 s, tap Continue. The rail's second segment unlocks. Reload: it offers to resume.
4. Things to check by eye: captions sit at the bottom centre in Devanagari without clipping at 390 px width; the panel is reachable without zooming; the page does not scroll sideways; landscape and the fullscreen button work; on Slow 3G / data saver the first frame still appears (open Chrome DevTools remote debugging, Network: Slow 4G).
5. The signed-in path: `/course/hi/1` (needs an account of the Supabase project this preview uses: that is your real project, so use your own test account). Progress and answers fall back to this device while the migration is not applied. The old reading page stays reachable at `/course/hi/1?view=read`.
6. `/course` shows a "New · Video lessons" card only when the flag is on.

## Turning it off
Remove `NEXT_PUBLIC_VIDEO_COURSE` (or set it to `0`) and redeploy: the site behaves exactly as before (a regression test and a flag-off end-to-end suite pin the headers, the redirects, the reading flow and the landing page).
