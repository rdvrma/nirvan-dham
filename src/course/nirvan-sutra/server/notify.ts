// SERVER ONLY: forwards a seeker's own-words answers to the owner's inbox through Formspree.
// The answers are saved in the progress first; a failed or switched-off send never blocks the seeker.
//   NIRVAN_SUTRA_FORMSPREE_URL=https://formspree.io/f/<id>   send there (any environment)
//   NIRVAN_SUTRA_FORMSPREE_URL=off                           never send
//   (unset)                                                  production sends to the Nirvan Sutra form; development does not send
import type { LocaleCode } from '../types';

const NIRVAN_SUTRA_FORM = 'https://formspree.io/f/xbgdowwz';

export interface WrittenNotice {
  part: string;                 // e.g. "Stage S01 — अज्ञान"
  learner: { id: string; name: string | null; email: string | null };
  locale: LocaleCode;
  prompts: string[];
  answers: string[];
  objective?: { score: number; total: number };
}

export function formspreeUrl(): string | null {
  const v = process.env.NIRVAN_SUTRA_FORMSPREE_URL?.trim();
  if (v === 'off') return null;
  const url = v || (process.env.NODE_ENV === 'production' ? NIRVAN_SUTRA_FORM : null);
  return url && /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(url) ? url : null;
}

/** One email per submission: who, which part, every question with its answer. Returns whether Formspree accepted it. */
export async function sendWritten(n: WrittenNotice): Promise<boolean> {
  const url = formspreeUrl();
  if (!url) return false;
  const body: Record<string, string> = {
    _subject: `Nirvan Sutra · ${n.part} · ${n.learner.name ?? n.learner.email ?? 'साधक'}`,
    seeker: n.learner.name ?? '',
    seeker_email: n.learner.email ?? '',
    seeker_id: n.learner.id,
    language: n.locale,
    part: n.part,
  };
  if (n.learner.email) body.email = n.learner.email;   // Formspree uses it as the reply-to
  if (n.objective) body.objective = `${n.objective.score} / ${n.objective.total}`;
  n.prompts.forEach((q, i) => { body[`Q${i + 1}`] = q; body[`A${i + 1}`] = n.answers[i] ?? ''; });
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
    if (!r.ok) console.error('nirvan-sutra: formspree refused the answers', r.status);
    return r.ok;
  } catch (e) {
    console.error('nirvan-sutra: formspree unreachable', (e as Error).message);
    return false;
  }
}
