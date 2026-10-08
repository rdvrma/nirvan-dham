# Nirvan Sutra Patrika — bilingual integration

## Reader and library

- `/library` features Nirvan Sutra Patrika in the former Muktibodh feature space.
- The Muktibodh issue cards, read / PDF / share actions and source data remain intact below the feature.
- `/patrika?view=map` is the canonical reader. Existing `/magazine-lab` bookmarks redirect with their story, section, language and listening parameters preserved.
- `?lang=hi` / `?lang=en` are shareable edition links. Without an explicit language, the reader uses the website's existing `nirvan-dham-language` preference (browser storage and cookie).
- The reader's Hindi / English controls update that same preference. Switching editions retains the current story / collection. Playback stops on an edition change so the wrong-language recording cannot continue under the new text.

## Editorial content

The fourteen Hindi works remain unchanged. `english.json` contains the publishing-time transcreation, and `english-edits.ts` contains the editorial pass for natural titles, poems and interface wording. Both editions share IDs, paragraph boundaries, scene anchors and reading navigation. No translation API runs in a reader's browser.

English body type uses a Latin serif with generous leading. Map labels, accessibility text, collection pages, visual explanations, the five-scene feature and listening controls follow the selected edition.

## Listening

Each edition has fourteen pre-generated Sarvam recordings. Separate manifest files and track IDs keep Hindi / English listening positions independent. The five original Hindi songs remain available in both interfaces with an explicit original-Hindi label in English.

Regenerate a changed edition from the repository root:

```powershell
node scripts/generate-magazine-audio.cjs --language en --env-file <private-env-file>
node scripts/generate-magazine-audio.cjs --env-file <private-env-file>
```

This offline tool requires ffmpeg / ffprobe and a private `SARVAM_API_KEY`. It caches completed speech parts, hashes the source plus voice settings and only requests changed recordings. There is no public billable TTS endpoint.

## Verification

```powershell
node --test tests/magazine.test.cjs
npx tsc --noEmit
npm run build
```

The tests cover completeness of both editions, unchanged original Hindi articles, every translated scene anchor, five-scene paragraph continuity, language-preserving links and source hashes / files for both audio editions. Browser checks cover library language inheritance, switching an open article, English playback, map / collection / reader navigation and the mobile map.

Changes are prepared locally; publishing requires a Git push / deployment.
