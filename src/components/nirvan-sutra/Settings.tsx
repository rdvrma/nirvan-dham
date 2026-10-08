'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { act } from './api';
import { useCourse } from './CourseShell';
import type { LocaleCode } from '@/course/nirvan-sutra/types';

export default function Settings({ locales, locale, name: initial }: { locales: { code: LocaleCode; native: string; english: string }[]; locale: LocaleCode; name: string }) {
  const { ui, toast } = useCourse();
  const router = useRouter();
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const change = async (code: LocaleCode) => {
    if (code === locale) return;
    setBusy(true);
    try { await act('locale', { locale: code }); router.refresh(); toast(ui.languageChanged); } finally { setBusy(false); }
  };
  return (
    <div className="ns-stack-l">
      <section className="ns-panel">
        <h2 className="ns-h3">{ui.changeLanguage}</h2>
        <p className="ns-small ns-muted" style={{ marginTop: 6 }}>{ui.settingsLanguageNote}</p>
        <div className="ns-langs" role="group" aria-label={ui.changeLanguage} style={{ marginTop: 18 }}>
          {locales.map((l) => (
            <button key={l.code} className="ns-lang" aria-pressed={l.code === locale} lang={l.code} disabled={busy} onClick={() => change(l.code)}>
              <span className="ns-lang-native">{l.native}</span><span className="ns-lang-en">{l.english}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="ns-panel">
        <label className="ns-h3" htmlFor="ns-set-name" style={{ display: 'block' }}>{ui.settingsName}</label>
        <input id="ns-set-name" className="ns-input" style={{ marginTop: 12 }} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        <button className="ns-btn ns-btn-quiet" style={{ marginTop: 12 }} disabled={name === initial} onClick={async () => { await act('name', { name }); toast(ui.saved); router.refresh(); }}>{ui.save}</button>
      </section>
    </div>
  );
}
