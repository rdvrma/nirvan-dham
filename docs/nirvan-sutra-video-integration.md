# Nirvan Sutra video integration

## Production delivery (15 October 2026)

The 17 main films and three published optional question films use Public YouTube embeds. Hindi plays the original film audio. Ten other course languages use 200 duration-checked Sarvam M4A tracks stored on the existing Runpod `nvp-lesson-videos` network volume under `nirvan-sutra/course-audio/v1/`. The learner's selected locale chooses the corresponding audio URL automatically. The course player offers one Play tap, mutes YouTube, synchronizes the external audio to video time, and pauses the video if the dub cannot start. No always-on Runpod pod is needed.

The Runpod S3 API requires an Authorization header even for presigned requests. `GET /api/nirvan-sutra/audio/[filmId]/[locale]` authenticates the course learner with the site's Supabase session, reads the private object with server-only Runpod credentials, and streams it with byte-range support. The course files and keys are not shipped in the website bundle. Set `RUNPOD_S3_ACCESS_KEY_ID`, `RUNPOD_S3_SECRET_ACCESS_KEY`, `RUNPOD_S3_ENDPOINT`, `RUNPOD_S3_REGION`, `RUNPOD_S3_VOLUME_ID`, and `RUNPOD_COURSE_AUDIO_READY=1` in the production environment. The key has account-wide S3-compatible volume read/write scope; restrict who can see or edit the Vercel environment. Production progress is stored in the Supabase `ns_progress` table, keyed to the signed-in user.

The previous `/course/<lang>/...` lesson flow redirects to the new `/course` introduction. Publishing a further question film requires verifying its YouTube ID and uploading its ten audio tracks, then updating `content/videos.json`. Do not mark a pending film as published merely because its audio exists.

The historical notes below document the local preview before production preparation; their instructions to defer deployment are superseded by this section.

This document records the **local course preview** as checked on 15 October 2026. The 17-stage course is at `/nirvan-sutra/yatra`; the older `/course/<lang>/<chapter>` flow is separate. Nothing in this integration was pushed or deployed.

## Main films already linked

These are videos on the Aadisatv YouTube channel. All S01–S17 main videos are Public as checked in Studio on 15 October 2026. The course registry is `src/course/nirvan-sutra/content/videos.json`.

| Stage | Topic | YouTube video ID | Duration | Published YouTube audio shown in Studio |
| --- | --- | --- | --- | --- |
| S01 | अज्ञान | `E0U-Toeq5lY` | 12:32 | Hindi original, English, Bangla |
| S02 | जिज्ञासा | `yOtIMzqFbpM` | 13:02 | Hindi original, English, Bangla |
| S03 | विवेक | `gzE7_ZQ9JXw` | 12:28 | Hindi original, English, Bangla |
| S04 | वैराग्य | `xfxwSKibL_I` | 12:29 | Hindi original, English; Bangla **processing failed** |
| S05 | श्रवण | `blJtCHw2tZA` | 12:29 | Hindi original, English, Bangla |
| S06 | मनन | `i4TqoHT487w` | 12:28 | Hindi original |
| S07 | निदिध्यासन | `RzQ0onRtnAs` | 12:57 | Hindi original |
| S08 | नेति-नेति | `H8KjGHT2Ib4` | 12:49 | Hindi original |
| S09 | साक्षीभाव | `g_mvaIlNucg` | 12:44 | Hindi original |
| S10 | अनुभव | `oUiIDpJWVss` | 13:20 | Hindi original |
| S11 | अनुभवकर्ता | `RYFunvu9zBo` | 12:45 | Hindi original |
| S12 | आत्मविचार | `zLRGWwiFnNA` | 12:35 | Hindi original |
| S13 | आत्मज्ञान | `zI4WVUQfkTU` | 12:54 | Hindi original |
| S14 | ब्रह्मज्ञान | `DHCkFx3ZDZA` | 13:12 | Hindi original |
| S15 | अज्ञेयता | `jw-QQm0ohxg` | 13:03 | Hindi original |
| S16 | शून्यता / मौन | `ZhsgChccC_g` | 13:54 | Hindi original |
| S17 | स्थितप्रज्ञ जीवन | `2zG13d8rErQ` | 14:06 | Hindi original |

The English/Bangla tracks seen in Studio may be YouTube automatic dubs. Their voices and scripts were **not** matched against the Sarvam output. `youtubeAudioLocales` means only “a track is shown as published”, not “Sarvam dub approved”. Other course languages remain selectable for written content, with an honest missing-audio message when no dub is published.

S01–S17 are linked in the local course as real YouTube films. S15–S17 were SHA256 verified, uploaded, added to the course playlist, linked locally and later changed to Public on 15 October 2026. Their original language is Hindi.

## Optional question films

The separate Public [निर्वाण सूत्र प्रश्नोत्तर | ज्ञानमार्ग playlist](https://www.youtube.com/playlist?list=PLGV5on1ZgcWk) contains three Public films. The local course links `NS-S01-Q01` → `ksmxFMQrPus`, `NS-S01-Q03` → `BlyFDzJpmnY`, and `NS-S01-Q06` → `deFJlduE83E`. Their runtime and chapter metadata come from the delivered `youtube.json` files. These question films are optional for the learner.

Eight more completed question films are waiting to upload; YouTube returned “Daily upload limit reached” and its video verification remains in review. Uploads are paused at the owner's request until YouTube allows them. All 11 delivered question films have a `thumbnail-v2.jpg` replacement with the exact question readable, both locally and on the Runpod volume. The Runpod production renderer has also been updated for later question films. The original `thumbnail.jpg` files and SHA256 manifests were left untouched. YouTube blocked replacement of the first three existing thumbnails while video verification is in review, so their public thumbnails still show the earlier topic-only design. Use `thumbnail-v2.jpg` for later uploads.

S07–S11 are members of the existing course playlist. Their original video language is Hindi. The registry uses actual delivery durations and chapter timestamps. Sarvam dubs remain on Runpod; only Hindi is listed as automatically playable for these videos. Do not claim that their 11 audio tracks are available on YouTube.

Placeholder films cannot count as watched. The main film unlock is based on 90% of actual playback time, followed by the course's understanding check. Progress uses the current local learner store; this watch check is a UI safeguard, not a secure server-side proof.

## Runpod source and publishing boundary

The active production checkout is C:\Users\pc\nirvan-main17. Private Runpod volume nvp-lesson-videos holds the media, and its production record is /workspace/main17/series/gyanmarg/production.json. The selected 85 optional questions are recorded in series/gyanmarg/question85-selection.json in the pipeline checkout. Optional lessons enter the course only after delivery and YouTube publication.

The Runpod question queue is `question85-queue-v7`. It produces five rounds, each visiting stages S01–S17. The owner's 15 October instruction removed monetary stops for this queue; actual spend remains metered. The real narration duration gate remains. Rendered question films remain `ownerReview: pending`; each must be inspected before YouTube publication. The queue records its state at `/workspace/main17/state/question85-run.json`.

A private Runpod path cannot be used as a browser `<audio>` source. For each finished Sarvam dub, choose one publishing path when it is approved:

For **local development preview only**, the ignored `public/local-course-audio/` folder holds downloaded Sarvam M4A tracks. All 20 currently linked films (17 main and 3 questions) have ten local dub files each, 200 tracks total, verified against the Runpod delivery SHA256 manifests on 15 October 2026. All 200 audio durations were checked against their registered film durations with a two-second tolerance; none failed. Hindi plays the YouTube master. In development, `videoAsset` adds only tracks that physically exist there to the selected lesson; the player then starts the matching audio and muted YouTube video with one tap. Changing language remounts the player so the next tap uses the new language. The folder is Git-ignored and is not part of a production deployment. The owner must choose durable HTTPS media hosting before deploying this course.

1. **Recommended for one-tap playback:** publish a duration-matched dub at a durable browser-playable HTTPS URL and add `audio.<locale> = { "url": "…", "status": "published" }` to the lesson entry. The course player then gives one Play button that starts muted YouTube video plus the selected-language audio. Verify synchronization, seeking, pauses, mobile autoplay behavior, access control, and hosting cost before releasing it.
2. **YouTube creator dub:** add a finished track to the corresponding video in YouTube Studio and confirm it is published and audibly correct. Studio may require removing an automatic dub of that language first. The YouTube IFrame API does not expose an audio-track language selector, so the website cannot guarantee that the learner's course language is automatically selected in YouTube. This does not meet the one-tap requirement by itself.

Do not point `audio.<locale>.url` to a private S3 endpoint, a signed URL that expires during a lesson, a local `C:` path, or the Runpod volume path. Media files remain outside the website repository; the local course registry contains only YouTube IDs and metadata. No course code was pushed or deployed.

## Adding the remaining films

1. Match the delivered film to its approved topic and lesson key: main `NS-S06-MAIN` through `NS-S17-MAIN`, optional question `NS-S01-Q01` through `NS-S17-Q10`.
2. Verify the video ID, visibility, duration, and actual narration in YouTube Studio. Add the ID, provider, duration, revision, and publish status to `content/videos.json`.
3. Check each language in Studio before listing it in `youtubeAudioLocales`. A language option in the course UI alone is not proof that the video has that dub.
4. Preview locally, test the one-tap external dub when its URL exists, try a seek to the end (must not unlock), watch almost the whole film (should record progress), then complete the written understanding check.

Historical local-preview note: the Sarvam files were verified before the production Runpod delivery path and authenticated byte-range route above were added.
