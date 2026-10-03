# Video course: decisions log

Each decision with its reason, in order. The order that started this work: a video-lesson player for the Nirvan Sutra course app, behind a feature flag, on a branch, with a preview build; autonomous, no questions.

## D-001 Where the work happens
- The session runs on a local Windows machine (not a cloud session). The branch is `video-course` (it already holds the fixture and the schema doc, commit b2c3729, up to date with origin). No separate session branch was created: the final PR is `video-course` -> `main`. `main` is never touched.
- Reason: the order says "PR for the video-course branch"; a second branch would only add a merge.

## D-002 Stack facts that shape the design (read from the repo, not assumed)
- Next.js 16.2.9 (App Router, `output: 'standalone'`, React 19, Tailwind 4 installed but the course pages use inline styles with `var(--font-hind|inter|cormorant)` and the dark/gold palette `#050e07` / `#d4a843` / ivory `rgba(245,237,216,1)`), Supabase via `@supabase/ssr`, deployed on Vercel. `AGENTS.md` warns that this Next.js has breaking changes: its docs in `node_modules/next/dist/docs/` were consulted before writing route code.
- No unit-test runner exists (only ad-hoc `test-pw*.js` Playwright scripts at the repo root). Vitest and `@playwright/test` are added as dev dependencies (both MIT/Apache-2.0).
- The course language codes are `hi`, `en`, `hl` (Hinglish); the site UI language is `hi | en` (`src/lib/i18n.ts`). The reading flow lives at `/course/[lang]/[chapter]` (server component, Supabase `user_progress.highest_chapter_unlocked`), protected by `middleware.ts` for every `/course/*` path except `/course`.

## D-003 Security headers and middleware
- `next.config.ts` has a strict CSP: `connect-src` has no media host. hls.js and the manifest fetch need the media host, so the host of `VIDEO_BASE_URL` is added to `connect-src` and `media-src` ONLY when that variable is set (flag off and variable unset: headers are byte-identical to today; regression test).
- `middleware.ts` runs the Guard Dog (rate limit per IP and path) on every request except some static extensions. The fixture files (`.m4a`, `.vtt`, `.json`, `.m3u8`, `.m4s`) under `/course-fixture/` would be rate-limited; the matcher excludes that path prefix only (everything else unchanged).
