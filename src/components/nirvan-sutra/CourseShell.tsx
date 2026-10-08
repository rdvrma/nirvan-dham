'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import BrandMark from './BrandMark';
import { act, BASE } from './api';
import { LOCALES } from '@/course/nirvan-sutra/locales';
import type { LocaleCode } from '@/course/nirvan-sutra/types';

type Ui = Record<string, string>;
const UiCtx = createContext<{ ui: Ui; locale: LocaleCode; toast: (m: string) => void }>({ ui: {}, locale: 'hi', toast: () => {} });
export const useCourse = () => useContext(UiCtx);

export default function CourseShell({ ui, locale, enrolled, dev, children }: { ui: Ui; locale: LocaleCode; enrolled: boolean; dev: boolean; children: React.ReactNode }) {
  const path = usePathname();
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useCallback((m: string) => { setMsg(m); }, []);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 3600); return () => clearTimeout(t); }, [msg]);
  const native = LOCALES.find((l) => l.code === locale)?.native ?? locale;
  const here = (p: string) => (path === p || path?.startsWith(`${p}/`) ? 'page' : undefined);
  return (
    <UiCtx.Provider value={{ ui, locale, toast }}>
      <a className="ns-skip" href="#ns-main">{ui.skipToContent}</a>
      <header className="ns-top">
        <Link href={enrolled ? `${BASE}/dashboard` : `${BASE}/onboarding`} className="ns-brand" aria-label={ui.brand}>
          <BrandMark />
          <span>
            <span className="ns-brand-name">{ui.brand}</span>
            <span className="ns-brand-sub" style={{ display: 'block' }}>{ui.brandSub}</span>
          </span>
        </Link>
        {enrolled && (
          <nav className="ns-nav" aria-label={ui.dashboard}>
            <Link href={`${BASE}/dashboard`} aria-current={here(`${BASE}/dashboard`)} className="ns-hide-s">{ui.dashboard}</Link>
            <Link href={`${BASE}/glossary`} aria-current={here(`${BASE}/glossary`)} className="ns-hide-s">{ui.glossaryTitle}</Link>
            <Link href={`${BASE}/settings`} aria-current={here(`${BASE}/settings`)} className="ns-langpill" aria-label={`${ui.language}: ${native}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></svg>
              {native}
            </Link>
          </nav>
        )}
      </header>
      <main id="ns-main" className="ns-main" key={path}>
        <div className="ns-page">{children}</div>
      </main>
      {msg && <div className="ns-toast" role="status" aria-live="polite">{msg}</div>}
      {dev && <DevPanel ui={ui} />}
    </UiCtx.Provider>
  );
}

function DevPanel({ ui }: { ui: Ui }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const go = async (state: string) => {
    await act('demo', { state });
    setOpen(false);
    router.push(state === 'new' ? `${BASE}/onboarding` : `${BASE}/dashboard`);
    router.refresh();
  };
  const states: [string, string][] = [['new', ui.devStateNew], ['mid', ui.devStateMid], ['final-ready', ui.devStateFinal], ['nididhyasana', ui.devStateNid], ['completed', ui.devStateDone]];
  return (
    <div className="ns-dev">
      {open && (
        <div className="ns-dev-panel" role="dialog" aria-label={ui.devPanel}>
          <div className="ns-eyebrow">{ui.devPanel}</div>
          <p className="ns-small ns-muted" style={{ marginTop: 6 }}>{ui.devPanelNote}</p>
          {states.map(([s, label]) => <button key={s} className="ns-btn ns-btn-quiet" style={{ minHeight: 40, padding: '8px 14px' }} onClick={() => go(s)}>{label}</button>)}
          <Link href={`${BASE}/admin`} className="ns-btn ns-btn-quiet" style={{ minHeight: 40, padding: '8px 14px', marginTop: 6, width: '100%' }} onClick={() => setOpen(false)}>{ui.adminTitle}</Link>
        </div>
      )}
      <button className="ns-dev-fab" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={ui.devPanel}>DEV</button>
    </div>
  );
}
