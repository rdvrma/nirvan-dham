/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS runner compiles local TS without additional tooling. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

// Use the project's existing compiler: no test framework or extra dependency.
require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  module._compile(outputText, filename);
};
const { issue01 } = require("../src/data/nirvana-sutra/issue-01.ts");
const { flatEntries } = require("../src/data/nirvana-sutra/types.ts");
const { readMagazineLocation, magazineUrl } = require("../src/data/nirvana-sutra/navigation.ts");
const { flagshipScenes } = require("../src/data/nirvana-sutra/scenes.ts");
const { sceneAt, inquiryFrame, editorialProgress, editorialFrame, editorialItemFrame } = require("../src/data/nirvana-sutra/motion.ts");
const { scenesAfterBlock } = require("../src/data/nirvana-sutra/editorial-scenes.ts");
const { smoothPath, smoothSegments } = require("../src/components/magazine/mapGeometry.ts");
const { createHash } = require("node:crypto");
const entries = flatEntries(issue01);
const { narrationText, splitSpeech, sourceHash } = require("../scripts/magazine-audio-utils.cjs");
const narrationManifest = require("../src/data/nirvana-sutra/audio-manifest.json");
const path = require("node:path");
const { issue01English, englishText } = require('../src/data/nirvana-sutra/localization.ts');
const englishManifest = require('../src/data/nirvana-sutra/audio-manifest.en.json');

test('English edition is complete, preserves IDs and paragraph / scene positions', () => {
  const englishEntries = flatEntries(issue01English);
  assert.equal(englishEntries.length, entries.length);
  assert.doesNotMatch(JSON.stringify(issue01English), /[\u0900-\u097f]/);
  for (const [index, original] of entries.entries()) {
    const adapted = englishEntries[index];
    assert.equal(adapted.id, original.id);
    assert.equal(adapted.sectionId, original.sectionId);
    const sourceBlocks = original.body.split(/\n\s*\n/);
    const englishBlocks = adapted.body.split(/\n\s*\n/);
    assert.equal(englishBlocks.length, sourceBlocks.length, original.id);
    assert.ok(adapted.body.length > original.body.length * .6, original.id);
    for (const scene of adapted.editorialScenes ?? []) {
      assert.ok(englishBlocks.includes(scene.after), `${original.id}: ${scene.id} anchor`);
      assert.equal(scenesAfterBlock(adapted.editorialScenes, scene.after).filter(s => s.id === scene.id).length, 1);
    }
  }
  const adaptedFlagship = englishEntries.find(entry => entry.id === 'sadhak-se-satya-tak');
  assert.equal(flagshipScenes(adaptedFlagship.body).length, 5);
  assert.deepEqual(flagshipScenes(adaptedFlagship.body).flat(), adaptedFlagship.body.split(/\n\s*\n/));
  assert.equal(englishText(' सुख '), ' Pleasure ');
});

test('English audio matches the English edition, with separate resume IDs and local media', () => {
  const voice = { ...require('../scripts/magazine-audio-utils.cjs').VOICE, language_code: 'en-IN' };
  assert.deepEqual(Object.keys(englishManifest).sort(), entries.map(entry => entry.id).sort());
  for (const entry of flatEntries(issue01English)) {
    const audio = englishManifest[entry.id];
    assert.equal(audio.sourceHash, sourceHash(entry, voice), entry.id);
    assert.match(audio.src, /^\/magazine-audio\/narration\/en\//);
    assert.ok(fs.statSync(path.join(__dirname, '../public', audio.src)).size > 1000);
  }
  const enUrl = magazineUrl('https://example.test/patrika?view=map&lang=en', { view: 'content', entryId: 'man-ko-shaant-karna' });
  assert.equal(enUrl.searchParams.get('lang'), 'en');
});

test("every chapter has a generated, current Sarvam recording and all five songs exist", () => {
  assert.deepEqual(Object.keys(narrationManifest).sort(), entries.map(entry => entry.id).sort());
  for (const entry of entries) {
    const audio = narrationManifest[entry.id];
    assert.equal(audio.sourceHash, sourceHash(entry), `${entry.id}: regenerate after an editorial change`);
    assert.equal(audio.model, "bulbul:v3");
    assert.ok(audio.seconds > 10);
    assert.ok(fs.statSync(path.join(__dirname, "..", "public", audio.src)).size > 1000);
  }
  for (const name of ["jag-re-musafir", "safar-hi-sukoon", "sone-ki-zanjeerein", "mrityu-na-anta", "maun-ki-parakashtha"]) {
    assert.ok(fs.statSync(path.join(__dirname, "..", "public/magazine-audio/songs", `${name}.mp3`)).size > 1000);
  }
});

test("TTS chunks preserve all words, remain within API limits and handle long paragraphs", () => {
  const normalize = text => text.replace(/\s+/g, " ").trim();
  for (const text of [...entries.map(narrationText), "अ".repeat(5100), "एक वाक्य। ".repeat(1000)]) {
    const chunks = splitSpeech(text);
    assert.ok(chunks.every(chunk => chunk.length <= 2300));
    // A pathological single word is split only to satisfy the provider's hard limit.
    assert.equal(normalize(chunks.join("" )).replace(/\s/g, ""), normalize(text).replace(/\s/g, ""));
  }
});

test("seven destinations contain fourteen complete, uniquely identified entries", () => {
  assert.equal(issue01.sections.length, 7);
  assert.equal(entries.length, 14);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, 14);
  assert.equal(new Set(issue01.sections.map((section) => section.id)).size, 7);
  for (const section of issue01.sections) {
    assert.equal(section.entries.length, section.id === "kahani-van" ? 2 : section.mode === "hub" ? 4 : 1);
    for (const entry of section.entries) {
      assert.equal(entry.sectionId, section.id);
      assert.ok(entry.title && entry.body && entry.duration);
    }
  }
});

test("collections retain originals and add clearly marked editorial pieces", () => {
  assert.deepEqual(issue01.sections.filter((section) => section.mode === "hub").map((section) => section.entries.map((entry) => entry.id)), [
    ["kahani-van", "khidki-aur-aakash"],
    ["jo-vichar-ko-janta-hai", "jo-badalta-rahta-hai", "man-ko-shaant-karna", "ruk-kar-dekhna"],
    ["sadhak-se-satya-tak", "adhyatmik-anubhav-bhi-bit-jata-hai", "aatmabodh-ke-baad", "sambandhon-me-sunana"],
  ]);
});

test("every article survives a URL/refresh round trip", () => {
  for (const entry of entries) {
    const location = { view: "content", entryId: entry.id };
    assert.deepEqual(readMagazineLocation(magazineUrl("http://localhost:3000/magazine-lab", location).search, issue01), location);
  }
});

test("cover, map and both hubs survive a URL round trip", () => {
  const locations = [{ view: "cover" }, { view: "map" }, { view: "hub", sectionId: "gyan-path" }, { view: "hub", sectionId: "gehrai-sarovar" }];
  for (const location of locations) assert.deepEqual(readMagazineLocation(magazineUrl("http://localhost:3000/magazine-lab", location).search, issue01), location);
});

test("invalid links fall back to the map; existing collection story links still open", () => {
  for (const search of ["?story=missing", "?section=missing", "?story=%3Cscript%3E"]) assert.deepEqual(readMagazineLocation(search, issue01), { view: "map" });
  assert.deepEqual(readMagazineLocation("?story=gyan-path", issue01), { view: "content", entryId: "jo-vichar-ko-janta-hai" });
  assert.deepEqual(readMagazineLocation("?story=gehrai-sarovar", issue01), { view: "content", entryId: "sadhak-se-satya-tak" });
  assert.deepEqual(readMagazineLocation("?section=pravesh-dwar", issue01), { view: "content", entryId: "pravesh" });
});

test("navigation replaces stale reader parameters while preserving unrelated ones", () => {
  const url = magazineUrl("http://localhost:3000/magazine-lab?story=old&section=old&view=map&source=test#old", { view: "hub", sectionId: "gyan-path" });
  assert.equal(url.search, "?source=test&section=gyan-path");
  assert.equal(url.hash, "");
});

test("issue order runs through both collections before the closing silence", () => {
  assert.deepEqual(entries.map((entry) => entry.id), ["pravesh", "geet-vatika", "hasya-kunj", "kahani-van", "khidki-aur-aakash", "jo-vichar-ko-janta-hai", "jo-badalta-rahta-hai", "man-ko-shaant-karna", "ruk-kar-dekhna", "sadhak-se-satya-tak", "adhyatmik-anubhav-bhi-bit-jata-hai", "aatmabodh-ke-baad", "sambandhon-me-sunana", "maun-tat"]);
});

test("five flagship scenes preserve every original paragraph in order", () => {
  const entry = entries.find((entry) => entry.id === "sadhak-se-satya-tak");
  const scenes = flagshipScenes(entry.body);
  assert.equal(scenes.length, 5);
  assert.deepEqual(scenes.flat(), entry.body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean));
  assert.equal(scenes[2][0], "साधक कौन है?");
  assert.equal(scenes[4][0], "लहर को समुद्र बनने की आवश्यकता नहीं होती।");
});

test("future content edits never silently drop text when a scene marker is missing", () => {
  assert.deepEqual(flagshipScenes("पहला अनुच्छेद\n\nदूसरा अनुच्छेद"), [["पहला अनुच्छेद", "दूसरा अनुच्छेद"]]);
});

test("fast jumps, reverse scrolling and resize resolve from current geometry", () => {
  const at = (scroll, anchor = 450) => sceneAt(Array.from({ length: 5 }, (_, i) => ({ top: 300 + i * 1000 - scroll, height: 1000 })), anchor);
  assert.deepEqual(at(0), { scene: 1, progress: .15 });
  assert.deepEqual(at(4200), { scene: 5, progress: .35 });
  assert.deepEqual(at(2200), { scene: 3, progress: .35 });
  assert.deepEqual(at(0), { scene: 1, progress: .15 });
  assert.deepEqual(at(9000), { scene: 5, progress: 1 });
  assert.deepEqual(at(2200, 650), { scene: 3, progress: .55 });
  assert.deepEqual(sceneAt([{ top: 0, height: 0 }], 50), { scene: 1, progress: 1 });
});

test("inward markers meet at the still center; ocean loses its separate wave", () => {
  const first = inquiryFrame(4, 0), middle = inquiryFrame(4, .5), last = inquiryFrame(4, 1);
  assert.ok(first.targetX - first.seekerX > middle.targetX - middle.seekerX);
  assert.equal(last.seekerX, last.targetX);
  assert.equal(last.seekerY, last.targetY);
  assert.equal(last.ringOffset, 0);
  assert.equal(inquiryFrame(5, 0).waveOpacity, 1);
  assert.equal(inquiryFrame(5, 1).waveOpacity, 0);
  assert.equal(inquiryFrame(5, 1).seaAmplitude, 0);
});

test("route remains one continuous stroke, with matching highlight tangents", () => {
  const points = [{ x: 0, y: 0 }, { x: 10, y: 30 }, { x: 40, y: 10 }];
  const path = smoothPath(points), segments = smoothSegments(points);
  assert.equal(path.match(/M /g).length, 1);
  assert.equal(segments.length, 2);
  assert.ok(path.endsWith(segments[1].slice(segments[1].indexOf(" C") + 1)));
});

test("four authoritative UTF-8 article bodies remain present exactly once and unchanged", () => {
  // Digests verified against the user's authoritative file, 8 October 2026.
  const expected = {
    "jo-badalta-rahta-hai": "ba7437a92f4640558a0014a867f4a2458c1da046efc948a4fb31003fc11fed40",
    "man-ko-shaant-karna": "470b06556de8d0a8d3c39e0e27504e9526563813239a48f5afa19840f3045dc8",
    "adhyatmik-anubhav-bhi-bit-jata-hai": "81f865cd0fc7c21809de4e06508b6a7334b82e7fab96d7171802c89deb4813c4",
    "aatmabodh-ke-baad": "dbd733eb1f0aa1f121875d30b12c8d4c708a8217e840c0934078e4f61f8ab92c",
  };
  for (const [id, digest] of Object.entries(expected)) {
    const matches = entries.filter(entry => entry.id === id);
    assert.equal(matches.length, 1);
    assert.equal(createHash("sha256").update(matches[0].body).digest("hex"), digest);
  }
});

test("all fourteen long-form scenes resolve once at semantic breakpoints, in reading order", () => {
  for (const [id, count] of [["man-ko-shaant-karna", 5], ["jo-badalta-rahta-hai", 3], ["adhyatmik-anubhav-bhi-bit-jata-hai", 3], ["aatmabodh-ke-baad", 3], ["kahani-van", 1]]) {
    const entry = entries.find(entry => entry.id === id);
    const blocks = entry.body.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);
    assert.equal(entry.editorialScenes.length, count);
    assert.equal(new Set(entry.editorialScenes.map(scene => scene.id)).size, count);
    const inserted = blocks.flatMap(block => scenesAfterBlock(entry.editorialScenes, block));
    assert.deepEqual(inserted, entry.editorialScenes);
    for (const scene of inserted) assert.ok(scene.title && scene.caption && scene.description && scene.items.length);
  }
  assert.deepEqual(scenesAfterBlock(undefined, "unchanged prose"), []);
});

test("every normal reader has illustrations at unique anchors, with flagship motion retained", () => {
  for (const entry of entries) {
    if (entry.id === "sadhak-se-satya-tak") {
      assert.equal(flagshipScenes(entry.body).length, 5);
      continue;
    }
    assert.ok(entry.editorialScenes?.length, `${entry.id} must have a visible editorial scene`);
    const blocks = entry.body.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);
    assert.deepEqual(blocks.flatMap(block => scenesAfterBlock(entry.editorialScenes, block)), entry.editorialScenes, entry.id);
    assert.equal(new Set(entry.editorialScenes.map(scene => scene.id)).size, entry.editorialScenes.length);
  }
});

test("inline scenes clamp and reverse from geometry; passing forms cross the still center", () => {
  assert.equal(editorialProgress(1000, 590, 900), 0);
  assert.equal(editorialProgress(-590, 590, 900), 1);
  const middle = editorialProgress(300, 590, 900);
  assert.ok(middle > 0 && middle < 1);
  const positions = [800, 300, -250, 300, 800].map(top => editorialProgress(top, 590, 900));
  assert.deepEqual(positions, [0, middle, 1, middle, 0]);
  assert.ok(editorialProgress(300, 590, 1024) > middle);
  // Near the conclusion, the page may end before the natural animation endpoint.
  assert.equal(editorialProgress(18, 570, 1024, 18), 1);
  assert.ok(editorialProgress(300, 570, 1024, 18) < 1);
  assert.equal(editorialFrame(0).first, 1);
  assert.equal(editorialFrame(1).last, 1);
  assert.equal(editorialFrame(1).held, 0);
  assert.equal(editorialFrame(1).merge, 1);
  assert.ok(editorialItemFrame(.1, 0, 4).travel > 0);
  assert.ok(editorialItemFrame(.4, 0, 4).travel < 0);
  assert.equal(editorialItemFrame(1, 3, 4).show, 0);
});
