# Video course v2: report

Branch `video-course` (PR to `main`, **not merged**). Everything below was measured on this branch; where something could not be measured it says so.

## What was built
- **Feature flag** `NEXT_PUBLIC_VIDEO_COURSE` (default OFF). Off: the site is as before (pinned by unit tests and a flag-off end-to-end suite). On: a chapter with a manifest in `src/lib/video-course/config.ts` shows the video lesson; a chapter without one keeps the old reading flow. The old reading page is untouched and stays reachable at `?view=read`.
- **Player** (`src/components/video-course/`): `VideoSource` with `YouTubeSource` (IFrame API, `youtube-nocookie.com`, `enablejsapi=1`, `rel=0`, `playsinline=1`, `hl` from the site language) and `LocalSource` (the committed 540p proxy, optional HLS through a lazily loaded hls.js). Pauses at the manifest's think/reflection points (clock polled every 200 ms, seek-back guard), the reflection panel opens **below** the player, nothing is drawn over YouTube's UI, native controls stay on. Captions are our own overlay from the word-timing JSON (bottom centre, ~8 % margin, subtle scrim; YouTube's own captions are off). Progress rail with sequential unlock, no scores, no exams. "Ask the Guide" only calls an adapter hook (stub).
- **Progress and answers**: `ProgressAdapter` (`load`, `save`, `saveAnswer`, `listAnswers`) with `LocalStorageProgressAdapter` and `SupabaseProgressAdapter` (uses the site's existing client and session, degrades to localStorage when the tables are missing or the user is signed out). Migration `supabase/video-lesson-progress.sql` (tables `video_lesson_progress`, `video_lesson_answers`, RLS: own rows only, no admin/analytics path) is **written, not applied anywhere**. `privacy.md` lists nine decisions the owner must take before going live.
- **Manifests**: chapter-to-manifest map in config, runtime validation with zod, unknown fields ignored.
- **Docs**: `decisions.md` (D-001..D-005), `hosting.md` (YouTube setup, why not Vercel, gated videos never on unlisted YouTube), `privacy.md`, `preview.md`, `dependencies.md`, `progress.md`.
- **Separate chore**: dead Sarvam key fallback removed in its own branch and PR (rdvrma/nirvan-dham#1). One line, nothing else. The key is still in git history; rotating it is the owner's task.

## Verification (what was run, result)
| check | result |
|---|---|
| Unit and component tests (`npm test`, vitest) | **82 passed** in 6 files (manifest 7, config 10, logic 28, progress 25 incl. a mocked-Supabase RLS-like contract, component 9, local audio 3) |
| Type check (`tsc --noEmit`) | clean |
| ESLint on the files of this branch | 0 errors, 0 warnings (4 `react-hooks` errors in my first version were fixed) |
| ESLint, whole repository | 53 errors, 1615 warnings on this branch, **identical** to a fresh `origin/main` (53 / 1615): none are mine; not touched |
| `next build`, flag off | passes (38 s) |
| `next build`, flag on | passes (30 s) |
| Playwright e2e, flag on, Chrome channel (H.264), phone 390x844 and desktop 1280x800 | **18 / 18 passed** (9 tests per viewport) |
| Playwright e2e, flag off | **4 / 4 passed** (preview URL is 404, no landing card, chapter redirects to login, no video markup) |

The e2e run covers: load the lesson, play to the first pause point, the question opens below the player, write an answer, Continue (next segment unlocks), reload and resume, audio language list shows Hindi only while English is not enabled, captions on/off, "Ask the Guide" message, a stubbed YouTube IFrame API (question below the player, caption clear of the control bar, nothing drawn over the player), no sideways scroll at 390 px, keyboard and accessibility checks, time to first frame on Slow 4G. Screenshots (<= 1280 px wide; the phone ones are 780 px = 390 px at 2x) are in `docs/video-course/screens/`.

## Measured numbers (`docs/video-course/measurements.json`)
**JavaScript downloaded on a cold load** (`scripts/measure-js.mjs`: fresh browser, no cache, decoded bytes and gzip), production builds of `origin/main` (2c9f42d) and of this branch, same dummy Supabase env:

| route | main | this branch, flag off | this branch, flag on |
|---|---|---|---|
| `/` | 2232.4 KB raw / 608.4 KB gz | 2232.4 / 608.4 | 2232.4 / 608.4 |
| `/library` | 2272.1 / 618.5 | 2272.1 / 618.5 | 2272.2 / 618.6 |
| `/course` | 2285.3 / 623.4 | 2286.9 / 624.0 | 2286.9 / 624.0 |
| `/video-preview/1` | (route does not exist) | (404) | 1789.1 KB raw / 515.4 KB gz, 15 files |

- Delta on existing pages: **+0.0 to +1.6 KB raw** (the `/course` landing check). All of `src/components/video-course` is loaded only by the video routes.
- All static JS chunks of the build: main 5726.8 KB raw (44 files), branch 6740.5 KB (47 files), +1013.7 KB, but **the bulk is hls.js (one lazy chunk, 566 KB raw)**, which is loaded only when a lesson has an HLS playlist; checked: 0 of the 13 chunks loaded by the default preview page contain it. Chunk gz total 1190.5 KB vs 1476.3 KB.
- **Time to first frame, 540p proxy (7.7 MB), Chromium "Slow 4G" emulation (1.6 Mbit/s down, 150 ms RTT):** page ready 5.1 s (desktop 5163 ms, phone 5132 ms); from the play command to a decoded frame past 0.3 s: **2.6 s** (2615 / 2607 ms). On the fast local connection: ready 0.59 to 0.63 s, play to playing 1 to 2 ms.
- **Caption sync jitter against the player clock (local source):** p95 **1 ms** (desktop, 60 samples) and **2 ms** (phone, 59 samples); the threshold for falling back to sentence-level highlighting is 250 ms. Caption block bottom gap: 8.2 % (desktop) / 8.4 % (phone) of the player height.
- **Accessibility pass** (automated plus keyboard): 0 unnamed controls; focus order logical (back link, video controls, rail segment, caption select, Ask the Guide); visible focus ring; contrast title 16.8:1, "Ask the Guide" 8.8:1 (>= 4.5 required); with `prefers-reduced-motion` the page has 0 running transitions. This is an automated and keyboard check, **not a screen-reader session**; no one has used it with VoiceOver or NVDA.

## What is stubbed or not done (honest list)
- **No real YouTube video was used.** `youtubeIds` are `null`; the YouTube path was tested against a **stub of the IFrame API**, never against YouTube itself. **The clock jitter of the real YouTube player is therefore unmeasured**; the 1 to 2 ms above is the local `<video>` clock. The jitter meter and the sentence-level fallback are in place and unit-tested, but their threshold on real YouTube is untested. First thing to do on a preview with a real id: open `/video-preview/1?yt=<id>` and watch `window.__nirvanVideoDiag`.
- **"Ask the Guide"** does nothing except show the not-connected message and call the adapter hook.
- **Supabase**: the migration is not applied; the Supabase adapter was tested only against a mocked client. No real Supabase, Sarvam, RunPod or other service was contacted.
- **English** audio and captions are an unreviewed machine translation and hidden (`enabledLanguages: ["hi"]`); the code path is tested with English forced on.
- **Hinglish** has no track; a Hinglish site language uses the Hindi captions.
- **Only chapter 1** has a manifest. Chapters 2 and up use the old reading flow.
- **Phone testing on a real device was not done** (no device in this session); the phone checks are Chrome emulating 390x844 with touch UA. `preview.md` has the steps to do it.
- The automated VERIFIER-FAIL of the master (6.33 vs 6.5) stays on record; the owner's review accepted it for shipping (D-004).

## Risks
1. **Preview route exposes the lesson without sign-in** when `VIDEO_COURSE_PUBLIC_PREVIEW=1`. Never set it in Production (documented in `preview.md`; it is a runtime server variable and defaults off).
2. **"Only you can see it"** on the reflection panel is true for the app and RLS, not for someone with the service-role key or database access (privacy.md decision 2).
3. **Unlisted YouTube is not private**: anyone with the id can watch. Fine for ordinary course lessons, wrong for Deeksha-gated practice videos (hosting.md).
4. **Build-time flag**: `NEXT_PUBLIC_VIDEO_COURSE` is inlined at build time; changing it needs a redeploy.
5. The existing repository carries 53 lint errors and a large warning count (unchanged by this branch).
6. The hard-coded Sarvam key remains in git history until rotated (chore PR).

## How to test
`docs/video-course/preview.md`. Locally: `NEXT_PUBLIC_VIDEO_COURSE=1 npx next build` (the flag is read at build time), then `VIDEO_COURSE_PUBLIC_PREVIEW=1 node scripts/e2e-serve.mjs` (read at run time) and open `http://127.0.0.1:3100/video-preview/1`; tests: `npm test`, and with a build present `E2E_CHANNEL=chrome npx playwright test` (flag on) or `-c playwright.flagoff.config.ts` (flag off build).
