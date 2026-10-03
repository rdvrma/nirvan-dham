// The local source with English enabled: choosing the English audio mutes the video and plays the English audio file in step with it; Hindi uses the audio inside the MP4.
// (jsdom has no media pipeline, so play/pause/load are stubbed.)
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VideoLesson from '../VideoLesson';
import { getLessonConfig, type LessonConfig } from '@/lib/video-course/config';
import { LocalStorageProgressAdapter } from '@/lib/video-course/progress';
import { manifestJson, wordsEn, wordsHi } from '@/lib/video-course/__tests__/fixture';

const lesson: LessonConfig = { ...getLessonConfig(1)!, enabledLanguages: ['hi', 'en'] };

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  const table: Record<string, unknown> = {
    '/course-fixture/ch1/manifest.json': manifestJson(),
    '/course-fixture/ch1/captions/hi.words.json': wordsHi(),
    '/course-fixture/ch1/captions/en.words.json': wordsEn(),
  };
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: table[url] !== undefined, status: 200, json: async () => table[url], text: async () => '' }) as unknown as Response));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

async function tick(ms: number) { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); }

describe('local source audio language', () => {
  it('offers Hindi and English when English is enabled; Hindi plays the audio inside the MP4', async () => {
    render(<VideoLesson lesson={lesson} courseLang="hi" adapter={new LocalStorageProgressAdapter({ getItem: () => null, setItem: () => undefined })} backHref="/course" />);
    await tick(100);
    await tick(100);
    const select = screen.getByTestId('audio-select') as HTMLSelectElement;
    expect(select.disabled).toBe(false);
    expect([...select.options].map((o) => o.value)).toEqual(['hi', 'en']);
    const video = document.querySelector('video')!;
    expect(video.muted).toBe(false);
    expect(document.querySelector('[data-testid="lesson-audio"]')).toBeNull();
  });

  it('English audio: the video is muted and the English audio file takes over; going back to Hindi restores the video\'s own sound', async () => {
    render(<VideoLesson lesson={lesson} courseLang="hi" adapter={new LocalStorageProgressAdapter({ getItem: () => null, setItem: () => undefined })} backHref="/course" />);
    await tick(100);
    await tick(100);
    fireEvent.change(screen.getByTestId('audio-select'), { target: { value: 'en' } });
    await tick(100);
    await tick(100);
    const video = document.querySelector('video')!;
    const audio = document.querySelector('[data-testid="lesson-audio"]') as HTMLAudioElement;
    expect(video.muted).toBe(true);
    expect(audio).not.toBeNull();
    expect(audio.getAttribute('src') ?? audio.getAttribute('data-src')).toBe('/course-fixture/ch1/audio/en.m4a');
    fireEvent.change(screen.getByTestId('audio-select'), { target: { value: 'hi' } });
    await tick(100);
    await tick(100);
    expect(document.querySelector('video')!.muted).toBe(false);
  });

  it('the English course language starts on English audio and captions only when English is enabled', async () => {
    render(<VideoLesson lesson={lesson} courseLang="en" adapter={new LocalStorageProgressAdapter({ getItem: () => null, setItem: () => undefined })} backHref="/course" />);
    await tick(100);
    await tick(100);
    expect((screen.getByTestId('audio-select') as HTMLSelectElement).value).toBe('en');
    expect((screen.getByTestId('caption-select') as HTMLSelectElement).value).toBe('en');
    cleanup();
    render(<VideoLesson lesson={getLessonConfig(1)!} courseLang="en" adapter={new LocalStorageProgressAdapter({ getItem: () => null, setItem: () => undefined })} backHref="/course" />);
    await tick(100);
    await tick(100);
    expect((screen.getByTestId('audio-select') as HTMLSelectElement).value).toBe('hi'); // English hidden: Hindi
  });
});
