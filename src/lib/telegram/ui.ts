import translations from './ui-translations.json';
import type { BotLanguage } from './languages';

/** Pre-generated public UI text: commands never incur an AI request. */
export function localizeControlText(text: string, lang: BotLanguage): string {
  if (lang === 'hi' || lang === 'en') return text;
  return (translations as Record<string, Record<string, string>>)[lang]?.[text] ?? text;
}
