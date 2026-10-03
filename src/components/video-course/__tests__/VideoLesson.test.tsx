// Integration test of the player with a fake YouTube IFrame API: pause at the pause point, the reflection panel opens BELOW the player (never inside it), the answer
// is saved through the adapter, Continue resumes, the seek-back guard works, YouTube is configured as ordered, English stays hidden.
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VideoLesson from '../VideoLesson';
import { getLessonConfig, type LessonConfig } from '@/lib/video-course/config';
import { LocalStorageProgressAdapter, type StorageLike } from '@/lib/video-course/progress';
import { buildPlayerVars, YOUTUBE_EMBED_HOST } from '@/lib/video-course/sources/youtube';
import { manifestJson, wordsEn, wordsHi } from '@/lib/video-course/__tests__/fixture';

class Mem implements StorageLike {
  d = new Map<string, string>();
  getItem(k: string) { return this.d.get(k) ?? null; }
  setItem(k: string, v: string) { this.d.set(k, v); }
}

interface Created { opts: Record<string, unknown>; player: FakePlayer }
const created: Created[] = [];

class FakePlayer {
  time = 0;
  state = 2; // paused
  calls: string[] = [];
  seeks: number[] = [];
  constructor(public el: HTMLElement, public opts: Record<string, any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
    // the real API replaces the element with an iframe: do the same so the DOM looks like production
    const iframe = document.createElement('iframe');
    iframe.setAttribute('data-fake-youtube', String(opts.videoId));
    el.appendChild(iframe);
    created.push({ opts, player: this });
    setTimeout(() => opts.events.onReady(), 0);
  }
  playVideo() { this.calls.push('play'); this.state = 1; (this.opts.events as any).onStateChange({ data: 1 }); } // eslint-disable-line @typescript-eslint/no-explicit-any
  pauseVideo() { this.calls.push('pause'); this.state = 2; (this.opts.events as any).onStateChange({ data: 2 }); } // eslint-disable-line @typescript-eslint/no-explicit-any
  seekTo(s: number) { this.calls.push(`seek:${s}`); this.seeks.push(s); this.time = s; }
  getCurrentTime() { return this.time; }
  getDuration() { return 219.567; }
  getPlayerState() { return this.state; }
  getPlaybackRate() { return 1; }
  loadVideoById() { /* not used */ }
  destroy() { /* iframe removed with the host */ }
}

const lessonWithYouTube: LessonConfig = { ...getLessonConfig(1)!, youtubeIds: { hi: 'HINDIid0001', en: null } };

function stubFetch() {
  const table: Record<string, unknown> = {
    '/course-fixture/ch1/manifest.json': manifestJson(),
    '/course-fixture/ch1/captions/hi.words.json': wordsHi(),
    '/course-fixture/ch1/captions/en.words.json': wordsEn(),
  };
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const body = table[String(url)];
    return { ok: body !== undefined, status: body !== undefined ? 200 : 404, json: async () => body, text: async () => '' } as unknown as Response;
  }));
}

async function tick(ms: number) { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); }

beforeEach(() => {
  vi.useFakeTimers();
  created.length = 0;
  (window as any).YT = { Player: FakePlayer }; // eslint-disable-line @typescript-eslint/no-explicit-any
  stubFetch();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete (window as any).YT; // eslint-disable-line @typescript-eslint/no-explicit-any
});

async function mountLesson(adapter = new LocalStorageProgressAdapter(new Mem()), lesson = lessonWithYouTube) {
  render(<VideoLesson lesson={lesson} courseLang="hi" adapter={adapter} backHref="/course" readHref="/course/hi/1?view=read" />);
  await tick(50);
  await tick(50);
  return { adapter, player: created[0].player };
}

describe('YouTube configuration', () => {
  it('uses the privacy-enhanced host and the ordered player parameters', () => {
    expect(YOUTUBE_EMBED_HOST).toBe('https://www.youtube-nocookie.com');
    expect(buildPlayerVars('hi', 'https://x.example')).toMatchObject({ enablejsapi: 1, rel: 0, playsinline: 1, hl: 'hi', cc_load_policy: 0, controls: 1, origin: 'https://x.example' });
    expect(buildPlayerVars('en', 'https://x.example').hl).toBe('en');
  });
});

describe('player with the YouTube source', () => {
  it('creates the YouTube player with the Hindi id on the nocookie host and keeps its own captions off', async () => {
    await mountLesson();
    expect(created).toHaveLength(1);
    expect(created[0].opts.host).toBe('https://www.youtube-nocookie.com');
    expect(created[0].opts.videoId).toBe('HINDIid0001');
    expect(created[0].opts.playerVars).toMatchObject({ enablejsapi: 1, rel: 0, playsinline: 1, hl: 'hi', cc_load_policy: 0, controls: 1 });
    expect(screen.getByTestId('video-lesson').getAttribute('data-source')).toBe('youtube');
  });

  it('pauses at the first pause point, opens the reflection panel BELOW the player, saves the answer and continues', async () => {
    const { adapter, player } = await mountLesson();
    player.state = 1;
    player.time = 50.5;
    await tick(200);
    expect(screen.queryByTestId('reflection-panel')).toBeNull();

    player.time = 50.9; // crosses 50.842
    await tick(200);
    expect(player.calls).toContain('pause');
    const panel = screen.getByTestId('reflection-panel');
    const frame = screen.getByTestId('player-frame');
    // below, never inside or over the player
    expect(frame.contains(panel)).toBe(false);
    expect(frame.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // the prompts are the learner-facing questions only: no source flags
    expect(panel.textContent).toContain('आपके जीवन में कौन-सी बेचैनी');
    expect(panel.textContent).not.toMatch(/generated|reviewed|source|machine/i);

    const cont = screen.getByTestId('reflection-continue') as HTMLButtonElement;
    expect(cont.disabled).toBe(true); // nothing written yet and the skip delay has not passed
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'एक अनकही बेचैनी' } });
    expect(cont.disabled).toBe(false);
    await act(async () => { fireEvent.click(cont); await vi.advanceTimersByTimeAsync(10); });

    expect(screen.queryByTestId('reflection-panel')).toBeNull();
    expect(player.calls.at(-1)).toBe('play');
    const saved = await adapter.listAnswers('m2-nirvan-sutra-ch1');
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ pauseId: 'p-g1', promptIndex: 0, answer: 'एक अनकही बेचैनी' });
    const progress = await adapter.load('m2-nirvan-sutra-ch1');
    expect(progress?.completedPauseIds).toEqual(['p-g1']);
  });

  it('Continue unlocks without an answer after the skip delay', async () => {
    const { player } = await mountLesson();
    player.state = 1;
    player.time = 50.6; await tick(200);
    player.time = 50.9; await tick(200);
    const cont = screen.getByTestId('reflection-continue') as HTMLButtonElement;
    expect(cont.disabled).toBe(true);
    await tick(10_500);
    expect(cont.disabled).toBe(false);
    await act(async () => { fireEvent.click(cont); await vi.advanceTimersByTimeAsync(10); });
    expect(screen.queryByTestId('reflection-panel')).toBeNull();
  });

  it('the seek-back guard: jumping past a locked pause point returns to it and opens it', async () => {
    const { player } = await mountLesson();
    player.state = 1;
    player.time = 30; await tick(200);
    player.time = 150; await tick(200); // a seek far past 50.842
    expect(player.seeks).toContain(50.842);
    expect(player.calls).toContain('pause');
    expect(screen.getByTestId('reflection-panel')).toBeTruthy();
  });

  it('the rail locks later segments until their pause points are completed', async () => {
    await mountLesson();
    expect(screen.getByTestId('rail-seg-0').getAttribute('data-state')).not.toBe('locked');
    for (const i of [1, 2, 3, 4]) expect(screen.getByTestId(`rail-seg-${i}`).getAttribute('data-state')).toBe('locked');
  });

  it('draws the captions clear of YouTube\'s control bar and shows only Hindi in the language selectors (English is hidden)', async () => {
    const { player } = await mountLesson();
    player.state = 1;
    player.time = 2.9; await tick(200);
    const overlay = screen.getByTestId('caption-overlay');
    expect(overlay.style.bottom).toBe('max(8%, 52px)');
    expect(screen.getByTestId('caption-text').textContent).toContain('की');
    const audio = screen.getByTestId('audio-select') as HTMLSelectElement;
    expect([...audio.options].map((o) => o.value)).toEqual(['hi']);
    const caps = screen.getByTestId('caption-select') as HTMLSelectElement;
    expect([...caps.options].map((o) => o.value)).toEqual(['hi', 'off']);
  });

  it('Ask the Guide only calls the adapter hook and shows the not-connected message', async () => {
    await mountLesson();
    await act(async () => { fireEvent.click(screen.getByTestId('ask-guide')); await vi.advanceTimersByTimeAsync(5); });
    expect(screen.getByTestId('guide-message').textContent).toContain('गाइड अभी जुड़ा नहीं है');
  });

  it('shows a friendly error with a retry when the manifest cannot be read', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ schema: 'nope' }), text: async () => '' }) as unknown as Response));
    render(<VideoLesson lesson={lessonWithYouTube} courseLang="hi" adapter={new LocalStorageProgressAdapter(new Mem())} backHref="/course" />);
    await tick(50);
    expect(screen.getByRole('alert').textContent).toContain('यह पाठ अभी खुल नहीं सका');
    expect(screen.getByRole('alert').textContent).toMatch(/could not be read/);
  });
});
