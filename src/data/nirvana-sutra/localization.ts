import english from './english.json';
import { issue01 } from './issue-01';
import type { MagazineIssue } from './types';
import { englishEdits } from './english-edits';

export type MagazineLanguage = 'hi' | 'en';
const dictionary: Record<string, string> = { ...english, ...englishEdits };
export function englishText(text: string): string {
  if (!/[\u0900-\u097f]/.test(text)) return text;
  if (dictionary[text]) return dictionary[text];
  const trimmed = text.trim();
  if (dictionary[trimmed]) return text.replace(trimmed, dictionary[trimmed]);
  // Numerals can appear inside dynamic labels, apart from a complete text key.
  return text.replace(/[०-९]/g, digit => String('०१२३४५६७८९'.indexOf(digit)));
}
function localize(value: unknown): unknown {
  if (typeof value === 'string') return value.split(/\n\s*\n/).map(englishText).join('\n\n');
  if (Array.isArray(value)) return value.map(localize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localize(item)]));
  return value;
}
/** Stable IDs, paragraph boundaries and scene anchors are shared by both editions. */
export const issue01English = localize(issue01) as MagazineIssue;
export const magazineEditions = { hi: issue01, en: issue01English };
