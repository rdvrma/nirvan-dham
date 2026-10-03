# Video course: progress

Updated after every stage. Read this and `decisions.md` first on resume; run `bash scripts/cloud-bootstrap.sh` to rebuild tools.

- [x] 0 Branch merged with origin/video-course, bootstrap script + SessionStart hook, docs skeleton
- [x] 1 Read the repo, dependencies (hls.js, zod, vitest, Playwright; licenses in dependencies.md)
- [x] 2 Feature flag, config, flag-off regression test (CSP golden string, redirects, middleware matcher)
- [x] 3 Manifest schema (zod) and pure logic (pause, unlock, captions, jitter): 69 unit tests pass
- [~] 4 Player component written (VideoSource: YouTube + local; captions; rail; reflection panel below the player); component tests and e2e still to do
- [~] 5 Progress adapters + mocked-Supabase contract tests done, migration SQL written (supabase/video-lesson-progress.sql, NOT applied); privacy.md still to write
- [ ] 6 Hosting: hosting.md only (YouTube-first; no R2 script, per the amendment)
- [x] 7 Chapter page integration (flag, ?view=read), /course entry, public preview route /video-preview/[chapter] (typecheck clean)
- [ ] 8 Tests (unit, integration, e2e with screenshots), a11y and performance notes
- [ ] 9 Preview doc
- [ ] 10 chore/remove-dead-key branch and PR
- [ ] 11 Report, PR for video-course
