// The localized-audio seam of the course. The teaching films get their dubbed tracks in the production pipeline (nirvan-video-pipeline, factory/stages/dub.mjs:
// Sarvam bulbul:v3, speaker soham, every sentence timed to the Hindi film); the course only ever READS finished audio assets. Nothing here is called when a
// learner opens a lesson, and nothing here spends Sarvam credits: SarvamTTSProvider refuses to run unless explicitly enabled for an offline batch.
//   approved Hindi script -> approved translation -> Sarvam TTS -> localized audio -> final film/audio asset -> subtitles -> publish
import type { LocaleCode, PublishStatus } from './types';
import { localeInfo } from './locales';

export interface TTSRequest { lessonId: string; locale: LocaleCode; text: string; revision: number }
export interface TTSResult { lessonId: string; locale: LocaleCode; audioUrl: string | null; status: PublishStatus; provider: string }

export interface TTSProvider {
  readonly name: string;
  getVoice(locale: LocaleCode): { speaker: string; model: string; languageCode: string; pace: number };
  getLanguage(locale: LocaleCode): string;
  getStatus(lessonId: string, locale: LocaleCode): Promise<PublishStatus>;
  generateAudio(req: TTSRequest): Promise<TTSResult>;
}

const VOICE = { speaker: 'soham', model: 'bulbul:v3', pace: 0.9 };   // the series voice (nirvan-video-pipeline series.json)

/** Local and test provider: produces nothing, costs nothing, reports what would be made. */
export class MockTTSProvider implements TTSProvider {
  readonly name = 'mock';
  getVoice(locale: LocaleCode) { return { ...VOICE, languageCode: localeInfo(locale).sarvam }; }
  getLanguage(locale: LocaleCode) { return localeInfo(locale).sarvam; }
  async getStatus() { return 'placeholder' as PublishStatus; }
  async generateAudio(req: TTSRequest): Promise<TTSResult> { return { lessonId: req.lessonId, locale: req.locale, audioUrl: null, status: 'placeholder', provider: this.name }; }
}

/**
 * The Sarvam provider, for an OFFLINE batch only (never on a learner request). It is deliberately inert: generateAudio throws unless
 * NIRVAN_SUTRA_TTS_ENABLED=1 and a budget is configured, and even then the call is left to the production pipeline, which caches every sentence by
 * its content so nothing is paid twice. The course reads the resulting assets from content/videos.json.
 */
export class SarvamTTSProvider implements TTSProvider {
  readonly name = 'sarvam';
  getVoice(locale: LocaleCode) { return { ...VOICE, languageCode: localeInfo(locale).sarvam }; }
  getLanguage(locale: LocaleCode) { return localeInfo(locale).sarvam; }
  async getStatus() { return 'in-production' as PublishStatus; }
  async generateAudio(req: TTSRequest): Promise<TTSResult> {
    if (process.env.NIRVAN_SUTRA_TTS_ENABLED !== '1') throw new Error(`Sarvam TTS is disabled for the course (${req.lessonId}/${req.locale}): localized audio is produced by the video pipeline's dub stage, never at request time`);
    throw new Error('Run the dub in nirvan-video-pipeline (factory/stages/dub.mjs); the course only publishes its outputs');
  }
}

export const ttsProvider = (): TTSProvider => (process.env.NIRVAN_SUTRA_TTS === 'sarvam' ? new SarvamTTSProvider() : new MockTTSProvider());
