export const BOT_LANGUAGES = {
  hi: { name: 'Hindi', label: 'हिंदी', script: 'Devanagari' },
  en: { name: 'English', label: 'English', script: 'Latin' },
  es: { name: 'Spanish', label: 'Español', script: 'Latin' },
  fr: { name: 'French', label: 'Français', script: 'Latin' },
  de: { name: 'German', label: 'Deutsch', script: 'Latin' },
  pt: { name: 'Portuguese', label: 'Português', script: 'Latin' },
  it: { name: 'Italian', label: 'Italiano', script: 'Latin' },
  ar: { name: 'Arabic', label: 'العربية', script: 'Arabic' },
  zh: { name: 'Simplified Chinese', label: '中文', script: 'Simplified Chinese' },
  ja: { name: 'Japanese', label: '日本語', script: 'Japanese' },
  ko: { name: 'Korean', label: '한국어', script: 'Hangul' },
  ru: { name: 'Russian', label: 'Русский', script: 'Cyrillic' },
  tr: { name: 'Turkish', label: 'Türkçe', script: 'Latin' },
  id: { name: 'Indonesian', label: 'Bahasa Indonesia', script: 'Latin' },
  vi: { name: 'Vietnamese', label: 'Tiếng Việt', script: 'Latin' },
  th: { name: 'Thai', label: 'ไทย', script: 'Thai' },
  bn: { name: 'Bengali', label: 'বাংলা', script: 'Bengali' },
  gu: { name: 'Gujarati', label: 'ગુજરાતી', script: 'Gujarati' },
  mr: { name: 'Marathi', label: 'मराठी', script: 'Devanagari' },
  ta: { name: 'Tamil', label: 'தமிழ்', script: 'Tamil' },
  te: { name: 'Telugu', label: 'తెలుగు', script: 'Telugu' },
  kn: { name: 'Kannada', label: 'ಕನ್ನಡ', script: 'Kannada' },
  ml: { name: 'Malayalam', label: 'മലയാളം', script: 'Malayalam' },
  pa: { name: 'Punjabi', label: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
  od: { name: 'Odia', label: 'ଓଡ଼ିଆ', script: 'Odia' },
  ur: { name: 'Urdu', label: 'اردو', script: 'Urdu (Arabic script)' },
  ne: { name: 'Nepali', label: 'नेपाली', script: 'Devanagari' },
  uk: { name: 'Ukrainian', label: 'Українська', script: 'Cyrillic' },
  pl: { name: 'Polish', label: 'Polski', script: 'Latin' },
  nl: { name: 'Dutch', label: 'Nederlands', script: 'Latin' },
  sv: { name: 'Swedish', label: 'Svenska', script: 'Latin' },
  fa: { name: 'Persian', label: 'فارسی', script: 'Persian (Arabic script)' },
  he: { name: 'Hebrew', label: 'עברית', script: 'Hebrew' },
} as const;

export type BotLanguage = keyof typeof BOT_LANGUAGES;
export type LanguageKeyboard = { inline_keyboard: { text: string; callback_data: string }[][] };

export function isBotLanguage(value: string): value is BotLanguage {
  return Object.hasOwn(BOT_LANGUAGES, value);
}

export function languageKeyboard(page: 'global' | 'more' | 'welcome' = 'global'): LanguageKeyboard {
  if (page === 'welcome') return { inline_keyboard: [[
    { text: 'हिंदी', callback_data: 'lang:hi' },
    { text: 'English', callback_data: 'lang:en' },
    { text: '🌐 Languages', callback_data: 'langs:global' },
  ]] };
  const entries = Object.entries(BOT_LANGUAGES).slice(page === 'global' ? 0 : 16, page === 'global' ? 16 : undefined);
  const rows: LanguageKeyboard['inline_keyboard'] = [];
  for (let index = 0; index < entries.length; index += 3) {
    rows.push(entries.slice(index, index + 3).map(([code, language]) => ({ text: language.label, callback_data: `lang:${code}` })));
  }
  rows.push([{ text: page === 'global' ? '🌐 More languages →' : '← Global languages', callback_data: page === 'global' ? 'langs:more' : 'langs:global' }]);
  return { inline_keyboard: rows };
}
