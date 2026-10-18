// SERVER ONLY: what every course page needs — the learner's progress, their language and the interface strings for it.
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { LocaleCode, Progress } from '../types';
import { SOURCE_LOCALE, isLocale, localeInfo } from '../locales';
import { currentProgress, currentAccount } from './session';
import { storeMode } from './store';
import { uiStrings } from './content';

export const BASE = '/nirvan-sutra/yatra';

export function makeT(strings: Record<string, string>) {
  return (key: string, vars: Record<string, string | number> = {}) => (strings[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
export type T = ReturnType<typeof makeT>;

export async function courseContext() {
  const progress = await currentProgress();
  // A language chosen on /course applies to the lesson and its audio immediately,
  // including when a returning learner previously studied in another language.
  const chosen = (await cookies()).get('ns_lang')?.value;
  const locale: LocaleCode = isLocale(chosen) ? chosen : progress?.locale ?? SOURCE_LOCALE;
  const ui = uiStrings(locale);
  return { progress, locale, info: localeInfo(locale), ui, t: makeT(ui) };
}

/** With accounts (supabase mode) the course needs a signed-in learner; sends to the site's /login and back. */
export async function requireSignedIn(next: string = BASE) {
  if (storeMode() !== 'supabase') return null;
  const account = await currentAccount();
  if (!account) redirect(`/login?next=${encodeURIComponent(next)}`);
  return account;
}

/** Pages behind the language choice: a learner without a language goes to the onboarding first. */
export async function enrolledContext() {
  await requireSignedIn();
  const ctx = await courseContext();
  if (!ctx.progress?.locale) redirect(`${BASE}/onboarding`);
  return ctx as typeof ctx & { progress: Progress };
}
