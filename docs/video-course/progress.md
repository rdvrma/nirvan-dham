# Video course: progress

Updated after every stage. Read this and `decisions.md` first on resume; run `bash scripts/cloud-bootstrap.sh` to rebuild tools. Results and numbers: `report.md`.

- [x] 0 Branch merged with origin/video-course, bootstrap script + SessionStart hook, docs skeleton
- [x] 1 Read the repo, dependencies (hls.js, zod, vitest, Playwright; licenses in dependencies.md)
- [x] 2 Feature flag, config, flag-off regression test (CSP golden string, redirects, middleware matcher)
- [x] 3 Manifest schema (zod) and pure logic (pause, unlock, captions, jitter)
- [x] 4 Player component (VideoSource: YouTube + local; captions; rail; reflection panel below the player)
- [x] 5 Progress adapters + mocked-Supabase contract tests, migration SQL written (supabase/video-lesson-progress.sql, NOT applied), privacy.md
- [x] 6 Hosting: hosting.md only (YouTube-first; no R2 script, per the amendment)
- [x] 7 Chapter page integration (flag, ?view=read), /course entry, public preview route /video-preview/[chapter]
- [x] 8 Tests: 82 unit/component, 18 e2e flag on (phone + desktop), 4 e2e flag off, screenshots, a11y and performance numbers
- [x] 9 Preview doc (preview.md)
- [x] 10 chore/remove-dead-key branch and PR (rdvrma/nirvan-dham#1)
- [x] 11 Report (report.md), PR for video-course (not merged)
