# Lesson manifest schema `nirvan-lesson-manifest/3` (player fixture)

The manifest is the one file a player needs to play a lesson: where the media are, how the timeline is cut (segments, sentences, beats, scenes/shots), where the pauses are, and which reflection questions to offer. `deliverables/player-fixture/manifest.json` is a real instance (chapter 1 of the Nirvan Sutra course, 3 min 40 s). It is built by `scripts/m2b-package.mjs` (full package, `out/m2b/package/manifest.json`) and `scripts/m2b-fixture.mjs` (the small fixture with proxy media). All times are seconds on the **Hindi master timeline** (`audio[0]`); the English track is placed on the same timeline, sentence by sentence. All paths are relative to the manifest file. A key that is `null` means "not applicable here", never "unknown". Changes from `/2`: `scenes[]` are shots with `parent` and `transitionIn`; `segments[].interaction.prompts[]` carry source flags; the `fixture` block exists only in the fixture.

## Top level
| field | type | meaning |
|---|---|---|
| `schema` | string | `nirvan-lesson-manifest/3`. A player must refuse a major version it does not know. |
| `id` | string | stable lesson id (`m2-nirvan-sutra-ch1`). |
| `verification` | string | `VERIFIER-PASS`, `VERIFIER-FAIL` or `UNVERIFIED`: the result of the automated review of the video (code checks + an independent reviewer model). **Never** human approval. This fixture is `VERIFIER-FAIL` (mean 6.33 of the frozen 6.5). |
| `verificationNote` | string | plain statement of what the verification is and is not. Show it wherever the label is shown. |
| `durationSec` | number | length of the master and of the Hindi audio. |
| `chapter` | object | what the lesson is. |
| `source` | object | where the text comes from. |
| `video` | object | the picture. |
| `audio` | array | narration tracks. |
| `captions` | array | caption files per language. |
| `labels` | object | the diagram labels (gold text inside the picture) per language. |
| `segments` | array | the lesson in 30-90 s teaching units, each ending in a pause point. |
| `sentences` | array | the narrated sentences with their times and text. |
| `beats` | array | the timing units of the film (an event on screen per beat). |
| `scenes` | array | the pictures of the film (scenes and shots). |
| `pausePoints` | array | where a player may pause or offer a reflection. |
| `englishTrack` | object | state of the English proof track. |
| `fixture` | object | only in the fixture: how it was built and every file with size and hash. |

## `chapter`
`course` (string, course name), `number` (int, chapter number), `khand` (string, the part of the course), `title.hi` / `title.en` (strings), `subtitle.hi` / `subtitle.en` (strings, the chapter's question: "who am I?").

## `source`
The lesson narrates the course text **verbatim** up to a cut. `course`, `chapter`, `khand` repeat the chapter identity; `khand_title` (string) the title of the part; `corpus_file` (string) the text file in the repository; `corpus_lines` (array of 2 ints, first and last line); `json_file` and `json_path` (strings) where the same text lives in the app's data; `repo` (string) the repository of the course; `commit` (string) the commit of the text that was read; `source_sha256` (string) hash of the text; `cut` (object: `after_paragraph` int, `last_included` string, `first_excluded` string, `note` string) where the lesson stops (always a paragraph boundary); `verbatim` (bool, always true); `word_count` (int); `englishReference` (string, the authorised English text used only as a terminology reference).

## `video`
`master` (string, the file to play: in the fixture the 540p proxy), `width`, `height`, `fps` (ints), `codec` (`h264+aac`), `hls` (string or null: an HLS master playlist with Hindi default and English alternate audio exists in the full package; null in the fixture), `textFree` (string: the master carries no captions, captions are separate files; the gold diagram labels are part of the drawing), `sourceMaster` (object `width`, `height`, `file`: the 1080p master the proxy was made from; not in the fixture).

## `audio[]`
One entry per language. `lang` (`hi` | `en`), `file` (string, AAC m4a), `default` (bool; exactly one is true, the Hindi master), `role` (string: `master timeline` or `proof track (machine translation, not human-reviewed)`), `voice` (string: model, speaker and pace of the machine voice).

## `captions[]`
`lang`, `vtt` (WebVTT file, 1-2 lines per cue, sorted, inside `durationSec`), `wordTiming` (JSON with one entry per word and its start and end), `wordTimingMethod` (string: `ctc forced alignment` for Hindi, `estimated, proportional to characters (not forced-aligned)` for English), and for English `status: "proof"`.

## `labels`
`hi` and `en` (strings: file names of the label texts, `labels.hi.json`, `labels.en.json`, in the full deliverables), `note` (string: only the diagram scenes sc05, sc08, sc10, sc12, sc13 carry labels; another language re-renders only those).

## `segments[]`
A teaching unit. `id` (`g1`..), `label` (string), `startSec`, `endSec`, `durationSec` (numbers), `sentences` (array of sentence ids), `scenes` (array of **plan scene** ids, the parent ids of `scenes[].parent`), `pauseMarker` (`atSec`, `durationSec`: the quiet moment at the end of the segment), `visualEvent` (string, what changes on screen at the segment's end), `interaction.prompts[]`.

### `segments[].interaction.prompts[]` (reflection questions, with source flags)
`hi`, `en` (the question), `source` (`generated`: written for the player by the planning step, **not** part of the lesson text), `reviewed` (bool, false: no human has checked it), `languageSource.hi` (`authored with the segment`), `languageSource.en` (`machine translation`), `narrated` (bool, false: never spoken in the film), `inLessonText` (bool, false). A player may show them in the quiet moment of the segment's pause point, must show the `reviewed`/`languageSource` status where it shows the question, and must never treat them as course text.

## `sentences[]`
`id` (`s01`..), `startSec` (number), `speechEndSec` (number, when the voice stops), `pauseAfterSec` (number, designed silence after it), `text.hi` (the course text, verbatim), `text.en` (machine translation).

## `beats[]`
The timing units (at most 5 s of narration each). `id` (`b00`..), `kind` (`opening`, `narration`, `reflection`, `close`), `scene` (plan scene id), `sentence` (sentence id, or null for silent beats), `startSec`, `endSec`, `text.hi` (the words spoken in the beat), `strategy` (the visual strategy of the plan), `interactionStrategy` (`none`, `silence_open`, `pause_marker`, ...), `teachingIntent` (string, why the beat exists), `visualIdea` (string, what the plan says should be seen), `caption` (string, the caption shown for the beat), `keyIdea` (bool, the key sentences of the lesson).

## `scenes[]` (scenes and shots of the film)
A plan scene is cut into **shots** where it needs clearly different framings; a shot is one picture with one continuous camera. `id` (`sc04a`), `parent` (the plan scene id, `sc04`), `title`, `segment` (segment id), `beats` (array of beat ids; the shots of the film partition the 64 beats in order), `startSec`, `endSec`, `still` (id of the picture), `stillKind` (`master` | `detail`), `stillSource` (string: how the picture was made: generated by an edit model from the first picture, a crop of another picture, or a non-generative crop), `stillJudgeScore` (number 0-10 from the independent picture judge, or null for pictures the judge did not see), `transitionIn` (null for the first shot, else `{ type: "dip" | "fade", durationSec }`: the change from the previous shot; `dip` goes through very dark grey, `fade` is a cross-dissolve), `camera` (`waypoints` int, `zoomRange` [min, max]: the camera never zooms more than 0.14 within a shot).

## `pausePoints[]`
`id`, `kind` (`opening_silence` | `think` | `reflection`), `segment` (segment id, absent for the opening), `atSec`, `durationSec`, `autoResume` (bool, true: playback may resume by itself after the duration), and for reflections `playerHint` (string: offer an optional hold in the quiet frame, then resume).

## `englishTrack`
`published` (bool), `fit` (bool, every English sentence fits the time of its Hindi sentence), `loudnessMatched` (bool, -16 LUFS like the Hindi master), `driftFlags` (array of sentences whose back-translation drifted in meaning; empty), `glossaryViolations` (int), `round` (int, retranslation round), `publish` (bool), `note` (string: machine translation and machine voice, not human-reviewed; show it).

## `fixture` (only in `deliverables/player-fixture/manifest.json`)
`schema` (`nirvan-player-fixture/1`), `note` (string), `builtFrom` (`manifest` string, `masterSha256` string: hash of the 1080p master the proxy came from), `files[]` (`path`, `bytes`, `sha256` of every file of the fixture; each is below 25 MB).

## Rules for a player
1. Time is the Hindi master timeline; seek the English audio by the same seconds. 2. Show `verification` and `verificationNote`, and for the English track `englishTrack.note`. 3. Pause points are offers: `autoResume` says playback may continue by itself. 4. Prompts are never narrated and never course text. 5. A beat's `caption` is the caption text planned for that beat; the VTT files are authoritative for what is displayed. 6. Unknown optional keys must be ignored; an unknown `schema` major version must be refused.
