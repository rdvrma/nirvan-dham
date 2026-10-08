// The languages of Nirvan Sutra: exactly the languages the teaching films are voiced in (Hindi, the source, and the ten Sarvam bulbul:v3 voices of the dub).
// Adding a language: one entry here, a folder locales/<code>/ with ui.json and course.json, and the film audio for it.
import type { LocaleCode } from './types';

export interface LocaleInfo { code: LocaleCode; native: string; english: string; sarvam: string; script: string; fontVar: string }

export const LOCALES: LocaleInfo[] = [
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', sarvam: 'hi-IN', script: 'Devanagari', fontVar: '--ns-font-deva' },
  { code: 'en', native: 'English', english: 'English', sarvam: 'en-IN', script: 'Latin', fontVar: '--ns-font-latin' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali', sarvam: 'bn-IN', script: 'Bengali', fontVar: '--ns-font-beng' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', sarvam: 'ta-IN', script: 'Tamil', fontVar: '--ns-font-taml' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu', sarvam: 'te-IN', script: 'Telugu', fontVar: '--ns-font-telu' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati', sarvam: 'gu-IN', script: 'Gujarati', fontVar: '--ns-font-gujr' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada', sarvam: 'kn-IN', script: 'Kannada', fontVar: '--ns-font-knda' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam', sarvam: 'ml-IN', script: 'Malayalam', fontVar: '--ns-font-mlym' },
  { code: 'mr', native: 'मराठी', english: 'Marathi', sarvam: 'mr-IN', script: 'Devanagari', fontVar: '--ns-font-deva' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi', sarvam: 'pa-IN', script: 'Gurmukhi', fontVar: '--ns-font-guru' },
  { code: 'or', native: 'ଓଡ଼ିଆ', english: 'Odia', sarvam: 'od-IN', script: 'Oriya', fontVar: '--ns-font-orya' },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);
export const SOURCE_LOCALE: LocaleCode = 'hi';
export const isLocale = (v: unknown): v is LocaleCode => typeof v === 'string' && (LOCALE_CODES as string[]).includes(v);
export const localeInfo = (code: LocaleCode) => LOCALES.find((l) => l.code === code)!;

/** Where a missing string is looked up next: the learner's language, then English (understood across India), then the Hindi source. */
export const fallbackChain = (code: LocaleCode): LocaleCode[] => [...new Set<LocaleCode>([code, 'en', 'hi'])];
