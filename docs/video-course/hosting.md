# Hosting the lesson videos

**Decision (D-005): YouTube first.** The player talks to a `VideoSource` (`src/lib/video-course/sources/`). Today there are two: `YouTubeSource` (the IFrame Player API on the privacy-enhanced domain) and `LocalSource` (the committed 540p proxy, used by the preview and for any language that has no YouTube id yet). A CDN source (R2, Bunny, Mux, signed URLs...) can be added later as a third `VideoSource` without touching the player; no CDN upload script exists in this repository on purpose.

## Where a lesson gets its YouTube id
`src/lib/video-course/config.ts`, `LESSONS[<chapter>].youtubeIds = { hi: null, en: null }`. A `null` id means "use the local proxy for that language". Fill `hi` after the Hindi upload, `en` only when the English track has been reviewed and `enabledLanguages` is extended to `["hi", "en"]` (English is an unreviewed machine translation with a machine voice, so it stays hidden). Before committing an id, try it on a preview deployment: `/video-preview/1?yt=<11-character id>` (English: `&yten=<id>`).

## One-time YouTube setup (you do this, once)
1. **A dedicated channel for course videos only.** Create a separate Brand Account / channel (for example "Nirvan Sutra Course") that holds nothing but the lesson videos. Reasons: the main channel's audience, recommendations and comments must not mix with the course; embeds with `rel=0` show related videos from the SAME channel, and on a course-only channel that can only be other lessons.
2. **Upload the full-quality master, not the proxy.** The file to upload is the pipeline's 1080p master (`master.mp4`, about 97 MB for chapter 1, Hindi narration). The `master-540p.mp4` in `public/course-fixture/` is a 7.7 MB preview proxy; never upload it.
3. **Upload settings** (YouTube Studio, per video):
   - Audience: **"No, it's not made for kids"** (the course is for adults; "made for kids" would switch off comments, personalisation and some player features and is wrong for this content).
   - **Altered / synthetic content disclosure:** check this setting and answer it honestly. The pictures are AI-generated illustrations and the narration is a machine voice. YouTube asks creators to disclose realistic altered or synthetic content; whether a stylised, clearly animated lesson with a machine voice needs the label is YouTube's rule to apply, not ours to assume: read the current wording of the question and decide; if in doubt, disclose.
   - **Visibility: Unlisted** for course lessons (not Private: private videos cannot be embedded for other people). Unlisted means anyone who has the link or the id can watch; the id is visible in the page source. That is acceptable for ordinary, free course lessons and nothing more (see the next section).
   - **Allow embedding: on.** Comments off. Do not add end screens, cards or paid promotion.
   - Language of the video: Hindi (or English for the English upload). YouTube's own captions are not needed: the page draws its own from the word-timing file, and the player asks YouTube to keep its captions off (`cc_load_policy=0`).
4. Put the id into `config.ts`, test on a preview deployment on a phone (`preview.md`), then merge.

## Deeksha-gated practice videos must NEVER use unlisted YouTube
An unlisted video is not protected: anyone who is given or finds the link can watch it and share it, and YouTube offers no way to tie viewing to a signed-in learner or to an initiation (deeksha). Practice videos that are meant only for initiated or enrolled learners therefore need a different `VideoSource`: signed, expiring URLs from a CDN or a video platform with access control, checked against the learner's session on the server. Do not put such a video on YouTube in any visibility mode, and do not "temporarily" use the preview proxies for it either (they are public files in the repository).

## Why video must not be served from Vercel
Vercel's Hobby plan includes 100 GB of data transfer per month. A 94 MB master is 100 x 1024 / 94, about **1,090 views** per month before the allowance is gone (and every replay or seek over a progressive MP4 downloads more). Serving lessons from the site's own deployment would also put video bandwidth on the same budget as the pages and the AI Guide. YouTube serves the video from its own network at no transfer cost to the site. The 540p proxy (7.7 MB) lives in `public/` only so previews and tests work without any account; it is not a hosting plan.

## Later: a CDN source for gated lessons
Add `src/lib/video-course/sources/cdn.ts` implementing `VideoSource` (it can reuse the `LocalSource` element code with signed URLs and hls.js), select it in `createSource` by a per-lesson setting, and keep the same pause-point and caption logic. Nothing else changes.
