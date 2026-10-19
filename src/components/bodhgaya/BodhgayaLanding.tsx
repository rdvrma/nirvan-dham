'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type MouseEvent } from 'react';
import { LANGUAGE_STORAGE_KEY, isLanguage, saveLanguage, type Language } from '@/lib/i18n';
import { copy, photos, photoUrl } from './content';
import { sendMeetingRequest } from './meeting-request';
import s from './bodhgaya.module.css';

const LANGUAGE_EVENT = 'bodhgaya-language-change';
function subscribeLanguage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('popstate', callback);
  window.addEventListener(LANGUAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('popstate', callback);
    window.removeEventListener(LANGUAGE_EVENT, callback);
  };
}
function readLanguage(fallback: Language): Language {
  const query = new URLSearchParams(window.location.search).get('lang');
  if (isLanguage(query)) return query;
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch { /* The server-provided preference also works without local storage. */ }
  return fallback;
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'} /></svg>;
}
function WhatsAppIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a9 9 0 0 1-13.3 8L3 21l1.5-4.7A9 9 0 1 1 21 11.5Z" /><path d="M8 7.5c.5 4 3 6.5 7 7l1-2-2-1-1 1c-1.5-.6-2.4-1.5-3-3l1-1-1-2Z" /></svg>;
}

const featuredBooks = {
  en: [
    { slug: 'the-seeker-is-the-illusion', title: 'The Seeker Is the Illusion', cover: '/library/covers/the-seeker-is-the-illusion.png' },
    { slug: 'maya-and-mind', title: 'Maya and Mind', cover: '/library/covers/maya-and-mind.png' },
    { slug: 'who-is-god', title: 'Who Is God?', cover: '/library/covers/who-is-god.png' },
  ],
  hi: [
    { slug: 'main-kaun-hoon', title: 'मैं कौन हूँ', cover: '/library/covers/main-kaun-hoon.png' },
    { slug: 'maya-aur-man', title: 'माया और मन', cover: '/library/covers/maya-aur-man.png' },
    { slug: 'ishwar-kaun-hai', title: 'ईश्वर कौन है', cover: '/library/covers/ishwar-kaun-hai.png' },
  ],
} as const;

function MeetingForm({ lang, whatsappUrl }: { lang: Language; whatsappUrl: string }) {
  const c = copy[lang];
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const statusRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (status === 'success' || status === 'error') statusRef.current?.focus();
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (String(data.get('_gotcha') || '').trim()) return;
    inFlight.current = true;
    setStatus('sending');
    try {
      await sendMeetingRequest(data, { sourceUrl: window.location.href, language: lang });
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    } finally {
      inFlight.current = false;
    }
  }

  if (status === 'success') return <div className={s.success} ref={statusRef} tabIndex={-1} role="status">
    <span className={s.successMark} aria-hidden="true">✓</span>
    <h3>{c.successTitle}</h3><p>{c.successText}</p>
    <button type="button" className={s.primary} onClick={() => setStatus('idle')}>{c.again}<Arrow /></button>
  </div>;

  return <form onSubmit={submit} className={s.form} aria-busy={status === 'sending'}>
    <p className={s.formNote}>{c.requiredNote}</p>
    <div className={s.formGrid}>
      {(['naam', 'phone', 'email', 'desh', 'tithi'] as const).map((field) => {
        const required = field === 'naam' || field === 'phone' || field === 'email';
        return <label key={field} className={field === 'tithi' ? s.fullField : undefined}>
          <span>{c.fields[field]} {required ? <b>*</b> : <small>({c.optional})</small>}</span>
          <input name={field} required={required} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
            autoComplete={field === 'naam' ? 'name' : field === 'phone' ? 'tel' : field === 'email' ? 'email' : field === 'desh' ? 'address-level2' : 'off'}
            placeholder={c.placeholders[field]} maxLength={field === 'phone' ? 40 : 200} disabled={status === 'sending'} />
        </label>;
      })}
      <label className={s.fullField}><span>{c.fields.yatra} <b>*</b></span><textarea name="yatra" required rows={4} maxLength={4000} placeholder={c.placeholders.yatra} disabled={status === 'sending'} /></label>
    </div>
    <details className={s.extraFields}><summary>{c.extra}</summary><div className={s.formGrid}>
      <label><span>{c.fields.din}</span><select name="din" disabled={status === 'sending'}>{c.days.map((day) => <option key={day}>{day}</option>)}</select></label>
      <label><span>{c.fields.kaise}</span><select name="kaise" disabled={status === 'sending'}>{c.sources.map((source, i) => <option value={i === 0 ? '' : source} key={source}>{source}</option>)}</select></label>
    </div></details>
    <div className={s.honeypot} aria-hidden="true"><label>Leave empty<input name="_gotcha" tabIndex={-1} autoComplete="off" /></label></div>
    {status === 'error' ? <div className={s.error} ref={statusRef} tabIndex={-1} role="alert"><p>{c.error}</p><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">{c.whatsapp}<Arrow diagonal /></a></div> : null}
    <button className={s.primary} type="submit" disabled={status === 'sending'}>{status === 'sending' ? c.submitting : c.submit}<Arrow /></button>
    <p className={s.privacy}>{c.privacy}</p>
  </form>;
}

export default function BodhgayaLanding({ initialLanguage }: { initialLanguage: Language }) {
  const lang = useSyncExternalStore(subscribeLanguage, () => readLanguage(initialLanguage), () => initialLanguage);
  const c = copy[lang];
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const galleryTrigger = useRef<HTMLButtonElement | null>(null);
  const whatsappUrl = `https://wa.me/919334325558?text=${encodeURIComponent(lang === 'hi' ? 'नमस्ते, मैं बोधगया में आदिसत्व से मिलने के बारे में बात करना चाहता/चाहती हूँ।' : 'Hello, I would like to arrange a meeting with Aadisatv in Bodhgaya.')}`;

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add(s.revealed); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: .12 });
    root.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
    const chapters = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveChapter(Number((entry.target as HTMLElement).dataset.chapter)); });
    }, { rootMargin: '-28% 0px -42% 0px' });
    root.querySelectorAll('[data-chapter]').forEach((el) => chapters.observe(el));
    return () => { revealObserver.disconnect(); chapters.disconnect(); };
  }, []);

  function selectLanguage(next: Language) {
    try { saveLanguage(next); } catch { document.documentElement.lang = next; }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new Event(LANGUAGE_EVENT));
  }
  function openGallery(index: number, trigger: HTMLButtonElement) {
    setGalleryIndex(index); galleryTrigger.current = trigger; dialogRef.current?.showModal();
  }
  function closeGallery() { dialogRef.current?.close(); }
  function jumpTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    window.history.pushState(null, '', `#${id}`);
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 92, behavior: 'instant' });
  }

  return <div ref={rootRef} className={s.page} lang={lang}>
    <a className={s.skip} href="#main-content">{c.skip}</a>
    <header className={s.header}>
      <Link className={s.brand} href="/" aria-label={`${c.brand} — ${c.home}`}><Image src="/brand/nirvan-dham-logo.png" width={46} height={46} alt="" /><span>{c.brand}<small>NIRVANDHAM.IN</small></span></Link>
      <nav aria-label={lang === 'hi' ? 'पृष्ठ के भाग' : 'Page sections'}>{c.nav.map((label, i) => { const id = ['the-meeting', 'meet-aadisatv', 'plan-your-visit'][i]; return <a key={label} href={`#${id}`} onClick={(event) => jumpTo(event, id)}>{label}</a>; })}</nav>
      <div className={s.headerActions}><div className={s.language} aria-label="Language / भाषा"><button type="button" aria-pressed={lang === 'en'} onClick={() => selectLanguage('en')}>EN</button><span aria-hidden="true">/</span><button type="button" aria-pressed={lang === 'hi'} onClick={() => selectLanguage('hi')}>हिंदी</button></div><a href="#request-meeting" onClick={(event) => jumpTo(event, 'request-meeting')} className={s.headerCta}>{c.request}<Arrow diagonal /></a></div>
    </header>

    <main id="main-content">
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroCopy}><p className={s.eyebrow}><span className={s.dot} />{c.eyebrow}</p>
          <h1 id="hero-title">{c.title[0]}<em>{c.title[1]}</em></h1>
          <div className={s.heroRule} aria-hidden="true"><span>✧</span></div>
          <p className={s.heroIntro}>{c.intro}</p>
          <div className={s.heroActions}><a href="#request-meeting" onClick={(event) => jumpTo(event, 'request-meeting')} className={s.primary}>{c.request}<Arrow diagonal /></a><a href={whatsappUrl} className={s.secondary} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />{c.whatsapp}</a></div>
          <a className={s.heroPhone} href="tel:+919334325558" aria-label={`${c.callNow}: +91 93343 25558`}><span>{c.callNow}</span><strong>+91-9334325558</strong><Arrow diagonal /></a>
          <p className={s.heroNote}>{c.heroNote}</p>
          <a className={s.scrollLink} href="#the-meeting" onClick={(event) => jumpTo(event, 'the-meeting')}><span aria-hidden="true">↓</span>{c.scroll}</a>
        </div>
        <div className={s.heroVisual}><div className={s.orbit} aria-hidden="true" /><div className={s.heroPhoto}><Image src={photoUrl(0)} alt={c.galleryAlt} fill sizes="(max-width: 760px) 100vw, 52vw" loading="eager" fetchPriority="high" /><div className={s.photoGradient} /><span className={s.photoCaption}>{c.imageNote}<small>24.6951° N · 84.9913° E</small></span></div><span className={s.verticalNote} aria-hidden="true">PRESENCE · INQUIRY · SILENCE</span></div>
      </section>

      <div className={s.facts}>{c.facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>

      <section id="the-meeting" className={`${s.section} ${s.invitation}`} data-reveal>
        <p className={s.eyebrow}>{c.meetingLabel}</p><div><h2>{c.meetingTitle}</h2><div className={s.invitationText}><p>{c.meetingText}</p><p>{c.meetingEnd}</p></div></div>
      </section>

      <section className={s.experience} aria-labelledby="experience-title">
        <div className={s.experienceHeader}><p className={s.eyebrow}>{c.experienceLabel}</p><h2 id="experience-title">{c.experienceTitle}</h2></div>
        <div className={s.experienceGrid}>
          <div className={s.storyVisual}>
            {[4, 8, 6].map((photo, index) => <div key={photo} aria-hidden={activeChapter !== index} className={`${s.storyImage} ${activeChapter === index ? s.activeImage : ''}`}><Image src={photoUrl(photo)} alt={c.galleryAlt} fill sizes="(max-width: 760px) 90vw, 45vw" /><div className={s.photoGradient} /></div>)}
            <div className={s.storyCaption}><span>{String(activeChapter + 1).padStart(2, '0')} / 03</span><p>{c.chapters[activeChapter].name}</p><div className={s.storyIndicators}>{c.chapters.map((chapter, i) => <a href={`#chapter-${i}`} aria-label={chapter.name} aria-current={activeChapter === i ? 'step' : undefined} key={chapter.name}><span /></a>)}</div></div>
          </div>
          <div className={s.storySteps}>{c.chapters.map((chapter, index) => <article key={index} id={`chapter-${index}`} data-chapter={index} className={s.chapter}><span className={s.chapterNumber}>0{index + 1}</span><h3>{chapter.title}</h3><p>{chapter.text}</p><small>{chapter.note}</small></article>)}</div>
        </div>
      </section>

      <section id="meet-aadisatv" className={`${s.section} ${s.about}`} data-reveal>
        <div className={s.portrait}><Image src="/aadisatv/portrait.jpg" alt={lang === 'hi' ? 'आदिसत्व' : 'Aadisatv'} fill sizes="(max-width: 760px) 75vw, 32vw" /><div className={s.portraitLabel}>AADISATV<span>{lang === 'hi' ? 'आदिसत्व' : 'Spiritual dialogue & self-inquiry'}</span></div></div>
        <div className={s.aboutCopy}><p className={s.eyebrow}>{c.aboutLabel}</p><h2>{c.aboutTitle}</h2><p>{c.aboutText}</p><p>{c.aboutSecond}</p>
          <p className={s.credibilityLine}>{c.credibilityLine}</p>
          <div className={s.credibilityLinks}>
            <a href="https://www.google.com/search?q=Aadisatv" target="_blank" rel="noopener noreferrer"><span>{c.googleLink}</span><Arrow /></a>
            <Link href="/library" prefetch><span>{c.booksLink}</span><Arrow /></Link>
          </div>
        </div>
      </section>

      <section className={s.proof} aria-labelledby="proof-heading" data-reveal>
        <div className={s.proofIntro}>
          <p className={s.eyebrow}>{c.proofLabel}</p>
          <h2 id="proof-heading">{c.proofTitle}</h2>
          <p>{c.proofText}</p>
          <div className={s.lamp}><span aria-hidden="true">✧</span><div><h3>{c.lampTitle}</h3><p>{c.lampText}</p></div></div>
          <p className={s.freePromise}>{c.freeNote}</p>
          <a href="#request-meeting" className={s.proofCta} onClick={(event) => jumpTo(event, 'request-meeting')}>{c.request}<Arrow diagonal /></a>
        </div>
        <div className={s.proofEvidence}>
          <div className={s.proofHeading}><span>{c.bookLabel}</span><Link href="/library" prefetch>{c.bookAction}<Arrow diagonal /></Link></div>
          <div className={s.bookShelf}>{featuredBooks[lang].map((book) => <Link key={book.slug} href={`/library/${book.slug}`} prefetch className={s.book} aria-label={book.title}>
            <span className={s.bookCover}><Image src={book.cover} alt={book.title} fill sizes="(max-width: 760px) 29vw, 160px" /></span>
            <span className={s.bookTitle}>{book.title}</span>
          </Link>)}</div>
          <a className={s.searchCard} href="https://www.google.com/search?q=Aadisatv" target="_blank" rel="noopener noreferrer">
            <span className={s.searchGlyph} aria-hidden="true">↗</span><span><small>{c.searchLabel}</small><strong>{c.searchTitle}</strong><span>{c.searchNote}</span></span><Arrow diagonal />
          </a>
        </div>
      </section>

      <section className={s.gallery} data-reveal>
        <div className={s.galleryHeader}><div><p className={s.eyebrow}>{c.galleryLabel}</p><h2>{c.galleryTitle}</h2></div><div><p>{c.galleryNote}</p><button type="button" className={s.textButton} onClick={(e) => openGallery(0, e.currentTarget)}>{c.galleryOpen}<Arrow diagonal /></button></div></div>
        <div className={s.galleryStrip}>{[2, 5, 7, 9].map((index, position) => <button type="button" key={index} onClick={(e) => openGallery(index, e.currentTarget)} aria-label={`${c.galleryAlt} ${index + 1}`}><Image src={photoUrl(index)} alt="" fill sizes="(max-width: 760px) 67vw, 28vw" /><span aria-hidden="true">0{position + 1}<Arrow diagonal /></span></button>)}</div>
      </section>

      <section id="plan-your-visit" className={`${s.section} ${s.visit}`} data-reveal>
        <div><p className={s.eyebrow}>{c.visitLabel}</p><h2>{c.visitTitle}</h2><p className={s.visitAside}>{c.heroNote}</p><Link className={s.textButton} href="/donation">{c.support}<Arrow diagonal /></Link></div>
        <ol className={s.steps}>{c.steps.map(([title, description], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
      </section>

      <section className={s.faq} aria-labelledby="faq-heading"><h2 id="faq-heading">{c.faqTitle}</h2><div>{c.faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

      <section id="request-meeting" className={s.contact} aria-labelledby="contact-heading">
        <div className={s.contactCopy}><p className={s.eyebrow}>{c.contactLabel}</p><h2 id="contact-heading">{c.contactTitle}</h2><p>{c.contactText}</p><div className={s.directContact}><h3>{c.direct}</h3><p>{c.directText}</p><a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />{c.whatsapp}<Arrow diagonal /></a><a href="tel:+919334325558" aria-label={`${c.call}: +91 93343 25558`}>+91 93343 25558<Arrow diagonal /></a><a href="mailto:aadiguru@nirvandham.in" aria-label={`${c.emailLink}: aadiguru@nirvandham.in`}>aadiguru@nirvandham.in<Arrow diagonal /></a></div></div>
        <MeetingForm lang={lang} whatsappUrl={whatsappUrl} />
      </section>
    </main>

    <footer className={s.footer}><div><Link href="/">{c.brand}</Link><p>{c.footer}</p></div><nav aria-label={lang === 'hi' ? 'अन्य पृष्ठ' : 'More pages'}><Link href="/">{c.home}</Link><Link href="/online-samvad">{c.online}</Link><Link href="/donation">{c.support}</Link></nav><span>© {new Date().getFullYear()} Nirvan Dham</span></footer>
    <div className={s.mobileBar}><a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />WhatsApp</a><a href="#request-meeting" onClick={(event) => jumpTo(event, 'request-meeting')}>{c.request}<Arrow diagonal /></a></div>

    <dialog ref={dialogRef} className={s.lightbox} aria-label={c.galleryLabel} onClose={() => galleryTrigger.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) closeGallery(); }} onKeyDown={(event) => { if (event.key === 'ArrowRight') setGalleryIndex((i) => (i + 1) % photos.length); if (event.key === 'ArrowLeft') setGalleryIndex((i) => (i + photos.length - 1) % photos.length); }}>
      <div className={s.lightboxBody}><button type="button" className={s.close} onClick={closeGallery} aria-label={c.close}>×</button><div className={s.lightboxPhoto}><Image src={photoUrl(galleryIndex)} alt={`${c.galleryAlt} ${galleryIndex + 1}`} fill sizes="(max-width: 760px) 90vw, 650px" /></div><div className={s.lightboxControls}><button type="button" onClick={() => setGalleryIndex((i) => (i + photos.length - 1) % photos.length)} aria-label={c.previous}>←</button><span aria-live="polite">{galleryIndex + 1} / {photos.length}</span><button type="button" onClick={() => setGalleryIndex((i) => (i + 1) % photos.length)} aria-label={c.next}>→</button></div></div>
    </dialog>
  </div>;
}
