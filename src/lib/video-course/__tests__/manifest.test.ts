import { describe, expect, it } from 'vitest';
import { availableLanguages, audioFileFor, captionTrackFor, parseManifest, parseWordTiming, resolveMedia } from '../manifest';
import { manifestJson, wordsHi } from './fixture';

describe('manifest parsing', () => {
  it('reads the committed fixture manifest', () => {
    const r = parseManifest(manifestJson());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.id).toBe('m2-nirvan-sutra-ch1');
    expect(r.value.segments).toHaveLength(5);
    expect(r.value.pausePoints.filter((p) => p.kind !== 'opening_silence')).toHaveLength(5);
    expect(r.value.durationSec).toBeGreaterThan(200);
    expect(availableLanguages(r.value).sort()).toEqual(['en', 'hi']);
    expect(audioFileFor(r.value, 'hi')).toBe('audio/hi.m4a');
    expect(captionTrackFor(r.value, 'en')?.wordTiming).toBe('captions/en.words.json');
  });

  it('ignores unknown fields at every level (the pipeline may add fields later)', () => {
    const m = manifestJson();
    m.somethingNew = { a: 1 };
    m.segments[0].futureField = true;
    m.segments[0].interaction.prompts[0].extra = 'x';
    const r = parseManifest(m);
    expect(r.ok).toBe(true);
    if (r.ok) expect(JSON.stringify(r.value)).not.toContain('somethingNew');
  });

  it('never carries the pipeline source flags of prompts into the player model', () => {
    const r = parseManifest(manifestJson());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const prompt = r.value.segments[0].interaction.prompts[0] as Record<string, unknown>;
    expect(Object.keys(prompt).sort()).toEqual(['en', 'hi']);
  });

  it('answers a broken manifest with a plain sentence and a list of problems', () => {
    const m = manifestJson();
    delete m.durationSec;
    m.schema = 'something-else/9';
    const r = parseManifest(m);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.message).toMatch(/lesson manifest could not be read/);
    expect(r.issues.length).toBeGreaterThanOrEqual(2);
    expect(r.issues.join(' ')).toMatch(/durationSec/);
    expect(r.issues.join(' ')).toMatch(/schema/);
  });

  it('rejects input that is not an object', () => {
    expect(parseManifest(null).ok).toBe(false);
    expect(parseManifest('<html>').ok).toBe(false);
  });

  it('parses the word timing file and rejects a broken one', () => {
    const ok = parseWordTiming(wordsHi());
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.words.length).toBe(391);
    const bad = parseWordTiming({ words: [{ text: 'x' }] });
    expect(bad.ok).toBe(false);
  });

  it('resolves media paths against the manifest URL', () => {
    expect(resolveMedia('/course-fixture/ch1/manifest.json', 'audio/hi.m4a')).toBe('/course-fixture/ch1/audio/hi.m4a');
    expect(resolveMedia('https://cdn.example.com/c/ch1/manifest.json', 'video/x.mp4')).toBe('https://cdn.example.com/c/ch1/video/x.mp4');
  });
});
