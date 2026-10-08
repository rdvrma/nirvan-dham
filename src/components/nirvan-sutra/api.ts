'use client';
// The course's client calls: one POST per learner action (src/app/api/nirvan-sutra/[action]).
export async function act<T = Record<string, unknown>>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/nirvan-sutra/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data as T;
}

export const fmt = (s: string, vars: Record<string, string | number> = {}) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
export const BASE = '/nirvan-sutra/yatra';
