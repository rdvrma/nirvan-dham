'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';

// ── Pre-computed SVG mandala lines (static = no SSR/client hydration mismatch) ──
const MANDALA_LINES = [
  { x1: 585, y1: 450, x2: 864, y2: 450 },
  { x1: 567, y1: 517, x2: 819, y2: 620 },
  { x1: 517, y1: 567, x2: 620, y2: 819 },
  { x1: 450, y1: 585, x2: 450, y2: 864 },
  { x1: 383, y1: 567, x2: 280, y2: 819 },
  { x1: 333, y1: 517, x2: 81,  y2: 620 },
  { x1: 315, y1: 450, x2: 36,  y2: 450 },
  { x1: 333, y1: 383, x2: 81,  y2: 280 },
  { x1: 383, y1: 333, x2: 280, y2: 81  },
  { x1: 450, y1: 315, x2: 450, y2: 36  },
  { x1: 517, y1: 333, x2: 620, y2: 81  },
  { x1: 567, y1: 383, x2: 819, y2: 280 },
];


// ── Design tokens ──────────────────────────────────
const GOLD = '#d4a843';
const GOLD_DIM = 'rgba(212,168,67,0.65)';
const BG = '#080f0a';

// ── Bilingual copy ────────────────────────────────
const copy = {
  hi: {
    pill: 'निर्वाण सूत्र',
    heroTitle: 'साधना',
    heroSub: 'भीतर की यात्रा — तीन चरणों में',
    heroDesc: 'ये guided meditations आपको शोर से परे, साक्षी भाव में और स्वयं की प्रत्यक्ष पहचान की ओर ले जाती हैं।',
    cta1: 'अभी सुनना शुरू करें',
    cta2: 'ऑनलाइन संवाद',
    scrollDown: 'नीचे स्क्रॉल करें',
    guidedBy: 'आदिसत्व द्वारा निर्देशित',
    level1: { badge: '✓ मुक्त प्रवेश', title: 'प्रारंभिक', sub: 'जागृति का बीज', count: '8 सत्र उपलब्ध' },
    level2: { badge: '🔒 बंद', title: 'मध्यवर्ती', sub: 'साक्षी का जागरण', count: '8 सत्र' },
    level3: { badge: '🔒 बंद', title: 'विशेषज्ञ', sub: 'निर्वाण का द्वार', count: '8 सत्र' },
    trackTitle: '8 Guided Meditations',
    trackNote: 'अद्वैत वेदांत पर आधारित — English में उपलब्ध। हिंदी शीघ्र।',
  },
  en: {
    pill: 'Nirvan Sutra',
    heroTitle: 'Sadhana',
    heroSub: 'The Inner Journey — Three Stages',
    heroDesc: 'These guided meditations take you beyond mental noise, into witness awareness and the direct recognition of who you truly are.',
    cta1: 'Start Listening Now',
    cta2: 'Online Samvad',
    scrollDown: 'Scroll Down',
    guidedBy: 'Guided by Aadisatv',
    level1: { badge: '✓ Free Access', title: 'Beginner', sub: 'The Seed of Awakening', count: '8 Sessions Available' },
    level2: { badge: '🔒 Locked', title: 'Intermediate', sub: 'Awakening of the Witness', count: '8 Sessions' },
    level3: { badge: '🔒 Locked', title: 'Advanced', sub: 'The Gate of Nirvana', count: '8 Sessions' },
    trackTitle: '8 Guided Meditations',
    trackNote: 'Based on Advaita Vedanta — Available in English. Hindi coming soon.',
  },
} as const;

// ── Track data ────────────────────────────────────
interface Track {
  id: number;
  enTitle: string;
  hiTitle: string;
  enDesc: string;
  hiDesc: string;
  enFile: string | null;
  hiFile: string | null;
}

const BEGINNER_TRACKS: Track[] = [
  { id: 1, enTitle: 'Introduction To Oneness', hiTitle: 'एकत्व का परिचय', enDesc: 'Step back from mental chatter and connect with pure being.', hiDesc: 'मानसिक शोर से पीछे हटें और शुद्ध अस्तित्व से जुड़ें।', enFile: '/sadhana/en-01-introduction-to-oneness.mp3', hiFile: null },
  { id: 2, enTitle: 'The Witness Consciousness', hiTitle: 'साक्षी चेतना', enDesc: 'Discover the Sakshi Bhav — observe thoughts without judgment.', hiDesc: 'साक्षी भाव की खोज करें — बिना निर्णय के विचारों को देखें।', enFile: '/sadhana/en-02-witness-consciousness.mp3', hiFile: null },
  { id: 3, enTitle: 'Beyond The Ego', hiTitle: 'अहं के पार', enDesc: 'Look past superficial labels and rest in spacious awareness.', hiDesc: 'सतही पहचानों से परे देखें और विशाल जागरूकता में विश्राम करें।', enFile: '/sadhana/en-03-beyond-the-ego.mp3', hiFile: null },
  { id: 4, enTitle: 'The World As A Reflection', hiTitle: 'संसार — एक दर्पण', enDesc: 'See your environment as a reflection of one consciousness.', hiDesc: 'अपने परिवेश को एक चेतना के प्रतिबिंब के रूप में देखें।', enFile: '/sadhana/en-04-world-as-reflection.mp3', hiFile: null },
  { id: 5, enTitle: 'Embracing Inner Silence', hiTitle: 'आंतरिक मौन को अपनाना', enDesc: 'Journey into the quiet beneath thoughts and emotions.', hiDesc: 'विचारों और भावनाओं के नीचे की शांति में प्रवेश करें।', enFile: '/sadhana/en-05-embracing-inner-silence.mp3', hiFile: null },
  { id: 6, enTitle: 'The Path Of Neti Neti', hiTitle: 'नेति नेति का मार्ग', enDesc: '"Not This, Not That" — release identification with the transient.', hiDesc: '"नेति नेति" — अनित्य के साथ पहचान को छोड़ते जाएं।', enFile: '/sadhana/en-06-neti-neti.mp3', hiFile: null },
  { id: 7, enTitle: 'The Dreamer And The Dream', hiTitle: 'स्वप्नद्रष्टा और स्वप्न', enDesc: 'Recognize that the observer and the observed are one.', hiDesc: 'पहचानें कि द्रष्टा और दृश्य एक हैं।', enFile: '/sadhana/en-07-dreamer-and-dream.mp3', hiFile: null },
  { id: 8, enTitle: 'Open Eyed Awareness', hiTitle: 'खुली आँखों की जागरूकता', enDesc: 'Bridge formal meditation and daily life with panoramic presence.', hiDesc: 'ध्यान और दैनिक जीवन के बीच सेतु — सतत जागरूकता।', enFile: '/sadhana/en-08-open-eyed-awareness.mp3', hiFile: null },
];

// ── Wave bars ────────────────────────────────────
function WaveBars() {
  return (
    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'flex-end', height: '14px' }}>
      {[1, 2, 3, 4, 3].map((h, i) => (
        <span key={i} style={{ width: '2.5px', borderRadius: '1.5px', background: GOLD, opacity: 0.8, animation: `wv${(i % 4) + 1} ${0.55 + i * 0.08}s ease-in-out infinite alternate`, height: `${h * 25}%` }} />
      ))}
      <style>{`@keyframes wv1{from{height:25%}to{height:90%}} @keyframes wv2{from{height:45%}to{height:100%}} @keyframes wv3{from{height:60%}to{height:75%}} @keyframes wv4{from{height:20%}to{height:95%}}`}</style>
    </span>
  );
}

// ── Audio card ────────────────────────────────────
function AudioCard({ track, lang, isActive, onPlay }: { track: Track; lang: Language; isActive: boolean; onPlay: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [curTime, setCurTime] = useState('0:00');
  const [durTime, setDurTime] = useState('—:——');
  const [hov, setHov] = useState(false);
  const isHi = lang === 'hi';
  const title = isHi ? track.hiTitle : track.enTitle;
  const file = isHi ? track.hiFile : track.enFile;
  const isPlaceholder = !file;
  function fmt(s: number) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; }
  useEffect(() => { if (!isActive && playing) { audioRef.current?.pause(); setPlaying(false); } }, [isActive, playing]);
  function togglePlay() {
    if (!audioRef.current || isPlaceholder) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { onPlay(); audioRef.current.play().then(() => setPlaying(true)).catch(() => {}); }
  }
  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const r = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth;
    a.currentTime = r * a.duration;
  }
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderRadius: '10px', border: `1px solid ${playing ? `${GOLD}55` : hov && !isPlaceholder ? `${GOLD}28` : `${GOLD}12`}`, background: playing ? 'rgba(13,31,16,0.92)' : 'rgba(13,31,16,0.5)', backdropFilter: 'blur(12px)', transition: 'all 0.3s', opacity: isPlaceholder ? 0.55 : 1, boxShadow: playing ? `0 4px 24px rgba(212,168,67,0.1)` : 'none' }}>
      {file && <audio ref={audioRef} src={file} preload="metadata" onLoadedMetadata={() => setDurTime(fmt(audioRef.current!.duration))} onTimeUpdate={() => { const a = audioRef.current; if (!a?.duration) return; setProgress((a.currentTime / a.duration) * 100); setCurTime(fmt(a.currentTime)); }} onEnded={() => { setPlaying(false); setProgress(0); setCurTime('0:00'); }} />}
      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '0.85rem', alignItems: 'center', padding: '0.9rem 1.1rem' }}>
        <button onClick={togglePlay} disabled={isPlaceholder} style={{ width: '40px', height: '40px', borderRadius: '50%', border: `1.5px solid ${playing ? GOLD : `${GOLD}40`}`, background: playing ? `${GOLD}18` : 'transparent', color: playing ? GOLD : GOLD_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isPlaceholder ? 'default' : 'pointer', fontSize: '0.85rem', transition: 'all 0.25s', flexShrink: 0 }}>
          {playing ? '⏸' : isPlaceholder ? '○' : '▶'}
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.58rem', color: GOLD_DIM, opacity: 0.55, letterSpacing: '0.1em' }}>{String(track.id).padStart(2, '0')}</span>
            <p style={{ color: playing ? 'var(--c-ivory)' : 'var(--c-ivdim)', fontWeight: playing ? 600 : 400, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s', flex: 1 }}>{title}</p>
            {playing && <WaveBars />}
          </div>
          {isPlaceholder && <p style={{ fontSize: '0.7rem', color: 'var(--c-ivdim)', opacity: 0.45 }}>{isHi ? '🔜 हिंदी शीघ्र' : '🔜 Coming soon'}</p>}
          {!isPlaceholder && (playing || progress > 0) && (
            <div onClick={seek} style={{ height: '2.5px', background: 'rgba(212,168,67,0.1)', borderRadius: '2px', cursor: 'pointer', position: 'relative', marginTop: '0.35rem' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: '2px', background: `linear-gradient(90deg,${GOLD},rgba(212,168,67,0.4))`, width: `${progress}%`, transition: 'width 0.1s linear' }} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
          {!isPlaceholder && <span style={{ fontSize: '0.68rem', color: GOLD_DIM, letterSpacing: '0.04em' }}>{playing || progress > 0 ? `${curTime}/${durTime}` : durTime}</span>}
          {!isPlaceholder && <a href={file!} download style={{ fontSize: '0.6rem', color: GOLD_DIM, border: `1px solid ${GOLD}22`, borderRadius: '999px', padding: '0.15rem 0.5rem', textDecoration: 'none', letterSpacing: '0.08em' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}15`; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            ↓ {isHi ? 'डाउनलोड' : 'DL'}
          </a>}
          {isPlaceholder && <span style={{ fontSize: '0.6rem', color: 'var(--c-ivdim)', opacity: 0.35 }}>{isHi ? 'शीघ्र' : 'Soon'}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Locked level ──────────────────────────────────
function LockedLevel({ lang, level }: { lang: Language; level: 'intermediate' | 'advanced' }) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const isHi = lang === 'hi';
  const isAdv = level === 'advanced';
  const accentColor = isAdv ? '#fb923c' : '#67e8f9';
  const levelName = isAdv ? (isHi ? 'विशेषज्ञ' : 'Advanced') : (isHi ? 'मध्यवर्ती' : 'Intermediate');
  const levelTitle = isAdv ? (isHi ? 'निर्वाण का द्वार' : 'The Gate of Nirvana') : (isHi ? 'साक्षी का जागरण' : 'Awakening of the Witness');
  const fieldSt: React.CSSProperties = { width: '100%', padding: '0.7rem 0.9rem', background: 'rgba(8,15,10,0.7)', border: `1px solid ${accentColor}22`, borderRadius: '7px', color: 'var(--c-ivory)', fontSize: '0.88rem', fontFamily: 'var(--font-hind)', outline: 'none' };
  const placeholderTracks = [isHi ? ['माया का स्वरूप','विचारों का उद्गम','भावनाओं का साक्षी','अहं की परतें','द्वैत से अद्वैत','चेतना का विस्तार','स्वयं की खोज','अद्वैत में जीवन'] : ['The Nature of Maya','Source of Thoughts','Witnessing Emotions','Layers of the Ego','Duality to Non-Duality','Expanding Consciousness','Self-Inquiry','Living in Non-Duality'], isHi ? ['प्रत्यक्ष दर्शन','शुद्ध जागरूकता','अहं का विसर्जन','तुरीय अवस्था','आत्मा का प्रकाश','निर्विकल्प समाधि','महावाक्य','मोक्ष की झलक'] : ['Direct Seeing','Pure Awareness','Ego Dissolution','The Turiya State','Light of the Self','Nirvikalpa Samadhi','The Mahavakyas','A Glimpse of Liberation']][isAdv ? 1 : 0];
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/xqeogwza', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...formData, _subject: `[साधना ${levelName}] Access — Nirvan Dham`, _source_page: `Sadhana ${levelName} Access`, _source_url: typeof window !== 'undefined' ? window.location.href : '/sadhana', _submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), _language: lang, _requested_level: level }) });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch { /* silent */ } finally { setSubmitting(false); }
  }
  return (
    <div style={{ borderRadius: '14px', border: `1px solid ${accentColor}18`, background: 'rgba(8,15,10,0.55)', backdropFilter: 'blur(14px)', overflow: 'hidden' }}>
      <div style={{ height: '2px', background: `linear-gradient(90deg,transparent,${accentColor},transparent)` }} />
      <div style={{ padding: 'clamp(1.25rem,3vw,2rem)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '50%', border: `1.5px solid ${accentColor}35`, background: `${accentColor}0e`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{isAdv ? '🔥' : '🌊'}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', color: `${accentColor}70`, textTransform: 'uppercase', marginBottom: '0.15rem' }}>{levelName} · 8 {isHi ? 'सत्र' : 'Sessions'}</p>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', color: 'var(--c-ivory)', lineHeight: 1.1 }}>{levelTitle}</h3>
          </div>
          <span style={{ padding: '0.25rem 0.8rem', borderRadius: '999px', border: `1px solid ${accentColor}30`, background: `${accentColor}0c`, color: accentColor, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em' }}>🔒 {isHi ? 'बंद' : 'Locked'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', opacity: 0.6 }}>
          {placeholderTracks.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.85rem', borderRadius: '7px', border: `1px solid ${accentColor}0d`, background: 'rgba(8,15,10,0.35)' }}>
              <span style={{ color: `${accentColor}50`, fontSize: '0.75rem', flexShrink: 0 }}>🔒</span>
              <span style={{ color: 'var(--c-ivdim)', fontSize: '0.85rem', flex: 1 }}>{t}</span>
              <span style={{ fontSize: '0.65rem', color: `${accentColor}35` }}>—:——</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '1rem 1.25rem', borderRadius: '8px', background: `${accentColor}06`, border: `1px solid ${accentColor}18`, marginBottom: '1rem' }}>
          <p style={{ color: 'var(--c-ivdim)', fontSize: '0.88rem', lineHeight: 1.8 }}>
            {isHi ? 'पहले प्रारंभिक के सभी 8 सत्र पूरे करें।' : 'Complete all 8 Beginner sessions first.'}
            <span style={{ display: 'block', fontSize: '0.7rem', color: accentColor, opacity: 0.6, fontStyle: 'italic', marginTop: '0.25rem' }}>
              ✦ {isHi ? 'गुरु की अनुमति के बिना आगे नहीं' : 'Cannot proceed without the Master\'s permission'}
            </span>
          </p>
        </div>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: `1px solid ${accentColor}40`, background: `${accentColor}10`, color: accentColor, fontWeight: 700, fontSize: '0.88rem', fontFamily: 'var(--font-hind)', cursor: 'pointer', letterSpacing: '0.05em' }}>
            {isHi ? '✋ Beginner पूरा किया — Access माँगें' : '✋ Completed Beginner — Request Access'}
          </button>
        ) : submitted ? (
          <div style={{ textAlign: 'center', padding: '1.25rem', borderRadius: '8px', border: `1px solid ${accentColor}25`, background: `${accentColor}07` }}>
            <p style={{ color: 'var(--c-ivory)', fontWeight: 600 }}>🙏 {isHi ? 'अनुरोध मिल गया' : 'Request received'}</p>
            <p style={{ color: 'var(--c-ivdim)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{isHi ? 'आदिसत्व शीघ्र संपर्क करेंगे।' : 'Aadisatv will connect with you soon.'}</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '1rem', borderRadius: '8px', border: `1px solid ${accentColor}18`, background: 'rgba(8,15,10,0.4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <input required style={fieldSt} placeholder={isHi ? 'नाम *' : 'Name *'} value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              <input required type="email" style={fieldSt} placeholder={isHi ? 'ईमेल *' : 'Email *'} value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <input required type="tel" style={fieldSt} placeholder={isHi ? 'WhatsApp *' : 'WhatsApp *'} value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
            <textarea rows={2} style={{ ...fieldSt, resize: 'vertical' }} placeholder={isHi ? 'अनुभव संक्षेप में...' : 'Share your experience briefly...'} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} />
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.65rem 1rem', borderRadius: '7px', border: '1px solid rgba(212,168,67,0.18)', background: 'transparent', color: GOLD_DIM, cursor: 'pointer', fontFamily: 'var(--font-hind)', fontSize: '0.85rem' }}>{isHi ? 'वापस' : 'Back'}</button>
              <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.65rem', borderRadius: '7px', border: `1px solid ${accentColor}40`, background: `${accentColor}12`, color: accentColor, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', fontFamily: 'var(--font-hind)', fontSize: '0.88rem' }}>
                {submitting ? '...' : (isHi ? '📩 अनुरोध भेजें' : '📩 Send Request')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════
export default function SadhanaPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const audioSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLang(getSavedLanguage());
    setMounted(true);
  }, []);

  function handleLangChange(next: Language) { setLang(next); saveLanguage(next); }

  const activeLang = mounted ? lang : 'hi';
  const isHi = activeLang === 'hi';
  const c = copy[isHi ? 'hi' : 'en'];

  function scrollToAudio() {
    audioSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: 'var(--c-ivory)', overflowX: 'hidden', fontFamily: 'var(--font-hind)' }}>
      <Header lang={activeLang} onLangChange={handleLangChange} />

      {/* ══════════ HERO SECTION ══════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {/* ── Full-screen dark gradient BG ── */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 70% at 50% 0%, rgba(26,92,53,0.38), transparent 65%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(61,138,88,0.14), transparent 60%), linear-gradient(to bottom, #080f0a 0%, #0a1a0e 60%, #080f0a 100%)` }} />

        {/* ── Subtle grid ── */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: `linear-gradient(rgba(212,168,67,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,67,.02) 1px,transparent 1px)`, backgroundSize: '70px 70px', pointerEvents: 'none' }} />

        {/* ── Spinning mandala ── */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          <svg width="900" height="900" viewBox="0 0 900 900" fill="none" aria-hidden suppressHydrationWarning style={{ opacity: 0.04, animation: 'sadhSpin 180s linear infinite' }}>
            <style>{`@keyframes sadhSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            {[414, 315, 225, 135].map((r, i) => <circle key={r} cx="450" cy="450" r={r} stroke="#d4a843" strokeWidth={i === 0 ? '1' : '0.6'} strokeDasharray={i % 2 ? '5 8' : undefined} />)}
            {MANDALA_LINES.map((l, i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#d4a843" strokeWidth="0.4" />)}
            <circle cx="450" cy="450" r="5" fill="#d4a843" opacity="0.5" />
          </svg>
        </div>

        {/* ── Main hero layout: text left, video right ── */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '6rem clamp(1.5rem,4vw,3rem) 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem,5vw,5rem)', alignItems: 'center' }} className="sadh-hero-grid">

          {/* ── LEFT — text ── */}
          <div>
            {/* Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', borderRadius: '999px', border: '1px solid rgba(212,168,67,0.3)', background: 'rgba(212,168,67,0.08)', marginBottom: '1.75rem' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: GOLD, animation: 'sadhPulse 2.5s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.22em', color: GOLD, textTransform: 'uppercase' }}>{c.pill}</span>
            </div>
            <style>{`@keyframes sadhPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}`}</style>

            {/* Main title */}
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 200, fontSize: 'clamp(4.5rem,9vw,8rem)', lineHeight: 0.88, color: 'var(--c-ivory)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
              {c.heroTitle}
            </h1>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.1rem,2.2vw,1.6rem)', fontWeight: 300, color: GOLD_DIM, fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.3 }}>
              {c.heroSub}
            </p>

            {/* Gold divider */}
            <div style={{ width: '80px', height: '1px', background: `linear-gradient(90deg,${GOLD},transparent)`, marginBottom: '1.5rem' }} />

            {/* Desc */}
            <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.95, fontSize: 'clamp(0.92rem,1.5vw,1.05rem)', marginBottom: '2.5rem', maxWidth: '440px' }}>
              {c.heroDesc}
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '3rem' }}>
              <button onClick={scrollToAudio} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.95rem 2.25rem', borderRadius: '6px', background: GOLD, color: '#0a1209', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', fontFamily: 'var(--font-hind)', boxShadow: `0 8px 32px rgba(212,168,67,0.3)`, transition: 'all 0.3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px rgba(212,168,67,0.4)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(212,168,67,0.3)`; }}>
                ▶ {c.cta1}
              </button>
              <Link href="/online-samvad" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.95rem 1.75rem', borderRadius: '6px', border: `1px solid ${GOLD}45`, background: `${GOLD}0d`, color: GOLD, fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.04em', transition: 'all 0.3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}18`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}0d`; }}>
                🌐 {c.cta2}
              </Link>
            </div>

            {/* 3 level badges */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { data: c.level1, color: GOLD, glow: 'rgba(212,168,67,0.12)' },
                { data: c.level2, color: '#67e8f9', glow: 'rgba(103,232,249,0.08)' },
                { data: c.level3, color: '#fb923c', glow: 'rgba(251,146,60,0.08)' },
              ].map((lv, i) => (
                <div key={i} style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', border: `1px solid ${lv.color}22`, background: `${lv.color}08`, flex: '1 1 auto', minWidth: '100px' }}>
                  <p style={{ fontSize: '0.58rem', color: `${lv.color}70`, letterSpacing: '0.1em', marginBottom: '0.2rem' }}>{lv.data.badge}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--c-ivory)', fontWeight: 600 }}>{lv.data.title}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--c-ivdim)', opacity: 0.6 }}>{lv.data.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Video avatar ── */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {/* Outer glow ring */}
            <div style={{ position: 'absolute', width: '110%', height: '110%', borderRadius: '50%', background: `radial-gradient(circle, rgba(26,92,53,0.22) 0%, transparent 70%)`, pointerEvents: 'none' }} />

            {/* Video circle container */}
            <div style={{ position: 'relative', width: 'clamp(280px,40vw,480px)', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${GOLD}22`, boxShadow: `0 0 80px rgba(26,92,53,0.3), 0 0 0 1px rgba(212,168,67,0.08), inset 0 0 60px rgba(212,168,67,0.04)`, background: 'rgba(8,15,10,0.8)' }}>
              <video
                autoPlay loop muted playsInline
                onCanPlay={() => setVideoLoaded(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: videoLoaded ? 1 : 0, transition: 'opacity 1s ease', transform: 'scale(1.05)' }}>
                <source src="/sadhana-hero/promo.mp4" type="video/mp4" />
                <source src="/sadhana-hero/aadisatv-guide.mp4" type="video/mp4" />
              </video>
              {/* Gradient overlay at bottom */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(8,15,10,0.7), transparent)', pointerEvents: 'none' }} />
              {/* Loading placeholder */}
              {!videoLoaded && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,15,10,0.8)' }}>
                  <div style={{ fontSize: '3rem', color: GOLD, opacity: 0.4, animation: 'sadhPulse 2s ease-in-out infinite' }}>◎</div>
                </div>
              )}
            </div>

            {/* Floating label */}
            <div style={{ position: 'absolute', bottom: 'clamp(-1rem,2vw,-0.5rem)', left: '50%', transform: 'translateX(-50%)', background: 'rgba(8,15,10,0.9)', backdropFilter: 'blur(12px)', border: `1px solid ${GOLD}28`, borderRadius: '999px', padding: '0.4rem 1.1rem', whiteSpace: 'nowrap' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.16em', color: GOLD_DIM, textTransform: 'uppercase' }}>{c.guidedBy}</p>
            </div>

            {/* Orbiting dot */}
            <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: `1px solid ${GOLD}12`, animation: 'sadhOrbit 12s linear infinite', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: '5%', left: '50%', width: '6px', height: '6px', borderRadius: '50%', background: GOLD, marginLeft: '-3px', boxShadow: `0 0 8px ${GOLD}` }} />
            </div>
            <style>{`@keyframes sadhOrbit{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={scrollToAudio} style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: 'none', cursor: 'pointer', color: GOLD_DIM, fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', animation: 'sadhFloat 3s ease-in-out infinite', zIndex: 10 }}>
          <span>{c.scrollDown}</span>
          <span style={{ display: 'block', width: '1px', height: '32px', background: `linear-gradient(to bottom,${GOLD_DIM},transparent)`, margin: '0 auto' }} />
        </button>
        <style>{`@keyframes sadhFloat{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(6px)}}`}</style>
      </section>

      {/* ══════════ AUDIO SECTION ══════════ */}
      <div ref={audioSectionRef} style={{ position: 'relative', zIndex: 2, maxWidth: '860px', margin: '0 auto', padding: '5rem clamp(1rem,4vw,2rem) 6rem' }}>

        {/* Beginner header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.4rem', borderRadius: '10px', background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: `1.5px solid ${GOLD}50`, background: `${GOLD}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🌱</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', color: GOLD_DIM, textTransform: 'uppercase', marginBottom: '0.15rem' }}>{isHi ? 'प्रारंभिक · मुक्त प्रवेश' : 'Beginner · Open Access'}</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', color: 'var(--c-ivory)', lineHeight: 1.1 }}>{c.trackTitle}</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'rgba(134,239,172,0.1)', border: '1px solid rgba(134,239,172,0.25)', color: '#86efac', fontSize: '0.62rem', fontWeight: 700 }}>✓ {isHi ? 'निःशुल्क' : 'Free'}</span>
            <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)', color: GOLD, fontSize: '0.62rem', fontWeight: 700 }}>↓ {isHi ? 'डाउनलोड' : 'Download'}</span>
          </div>
        </div>

        {isHi && (
          <div style={{ padding: '0.8rem 1.1rem', borderRadius: '7px', background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.12)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1rem' }}>🔜</span>
            <p style={{ color: 'var(--c-ivdim)', fontSize: '0.82rem', lineHeight: 1.7 }}>हिंदी ऑडियो शीघ्र। अभी <strong style={{ color: GOLD }}>EN</strong> चुनें।</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.5rem' }}>
          {BEGINNER_TRACKS.map(track => (
            <AudioCard key={track.id} track={track} lang={activeLang} isActive={activeTrack === track.id} onPlay={() => setActiveTrack(track.id)} />
          ))}
        </div>

        <div style={{ padding: '0.9rem 1.25rem', borderRadius: '8px', background: 'rgba(212,168,67,0.04)', border: '1px solid rgba(212,168,67,0.1)', textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ color: 'var(--c-ivdim)', fontSize: '0.85rem', lineHeight: 1.8 }}>
            ✦ {isHi ? 'सभी 8 सत्र पूरे करने के बाद मध्यवर्ती/विशेषज्ञ का access नीचे माँगें।' : 'After completing all 8, request Intermediate/Advanced access below.'}
          </p>
        </div>

        {/* Locked levels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
          <LockedLevel lang={activeLang} level="intermediate" />
          <LockedLevel lang={activeLang} level="advanced" />
        </div>

        {/* Samvad CTA */}
        <div style={{ textAlign: 'center', padding: '2.5rem 2rem', borderRadius: '14px', border: '1px solid rgba(212,168,67,0.16)', background: 'rgba(8,15,10,0.5)', backdropFilter: 'blur(14px)' }}>
          <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>🙏</div>
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--c-ivory)', marginBottom: '0.65rem' }}>
            {isHi ? 'आगे बढ़ने के लिए संवाद करें' : 'Connect to Go Deeper'}
          </h3>
          <p style={{ color: 'var(--c-ivdim)', fontSize: '0.88rem', lineHeight: 1.85, marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {isHi ? 'ये सत्र आपके भीतर कुछ जगा रहे हैं? आदिसत्व से सीधे संवाद करें।' : 'Are these sessions awakening something within? Connect directly with Aadisatv.'}
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/online-samvad" style={{ padding: '0.8rem 1.6rem', borderRadius: '7px', border: `1px solid ${GOLD}42`, background: `${GOLD}10`, color: GOLD, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.04em' }}>🌐 {isHi ? 'ऑनलाइन संवाद →' : 'Online Samvad →'}</Link>
            <Link href="/bodhgaya-samvad" style={{ padding: '0.8rem 1.6rem', borderRadius: '7px', border: '1px solid rgba(134,239,172,0.28)', background: 'rgba(134,239,172,0.07)', color: '#86efac', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.04em' }}>🪷 {isHi ? 'बोधगया संवाद →' : 'Bodhgaya Samvad →'}</Link>
          </div>
        </div>
      </div>


      {/* ══════════ NIRVAN SUTRA COURSE — Premium Highlight ══════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', margin: '0' }}>
        {/* Cinematic video background */}
        <video autoPlay muted loop playsInline src="/course-videos/hero.mp4" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2,
        }} />
        {/* Dark overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,14,7,0.97) 0%, rgba(8,20,10,0.85) 50%, rgba(5,14,7,0.97) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 50% at 80% 50%, rgba(212,168,67,0.06) 0%, transparent 70%)' }} />
        {/* Gold shimmer border top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #d4a843 25%, #ffe89a 50%, #d4a843 75%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1160px', margin: '0 auto', padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)' }}>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #d4a843)' }} />
            <span style={{ fontSize: '0.56rem', letterSpacing: '0.35em', color: '#d4a843', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', fontWeight: 700 }}>
              SHRAVANA · FLAGSHIP COURSE
            </span>
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, #d4a843, transparent)' }} />
          </div>

          {/* Main 2-col layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem,6vw,6rem)', alignItems: 'center' }} className="sadh-course-grid">

            {/* LEFT — text */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.9rem', borderRadius: '999px', border: '1px solid rgba(212,168,67,0.3)', background: 'rgba(212,168,67,0.07)', marginBottom: '1.5rem' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: GOLD, display: 'inline-block', animation: 'sadhPulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.6rem', color: GOLD, letterSpacing: '0.15em', fontFamily: 'var(--font-inter)' }}>
                  {isHi ? 'निर्वाण सूत्र पाठ्यक्रम' : 'NIRVAN SUTRA COURSE'}
                </span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-cormorant)', fontWeight: isHi ? 600 : 300,
                fontSize: 'clamp(2.8rem,5.5vw,4.8rem)', lineHeight: 1.05,
                color: 'var(--c-ivory)', marginBottom: '1.25rem',
                fontStyle: isHi ? 'normal' : 'italic',
              }}>
                {isHi ? 'आप कौन हैं?' : 'Who are you?'}
              </h2>

              <p style={{ color: 'rgba(245,237,216,0.58)', lineHeight: 1.95, fontSize: 'clamp(0.92rem,1.5vw,1.02rem)', marginBottom: '2.25rem', maxWidth: '460px', fontFamily: isHi ? 'var(--font-hind)' : 'var(--font-inter)' }}>
                {isHi
                  ? 'साधना के बाद अगला कदम है श्रवण। निर्वाण सूत्र पाठ्यक्रम में 8 अध्यायों में अद्वैत, आत्म-जांच और मुक्ति की गहरी यात्रा शुरू करें।'
                  : 'After Sadhana comes Shravana. Begin a deep journey through 8 chapters of Advaita, self-inquiry and liberation in the Nirvan Sutra Course.'}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {[
                  { num: '8', label: isHi ? 'अध्याय' : 'Chapters' },
                  { num: '3', label: isHi ? 'भाषाएं' : 'Languages' },
                  { num: '∞', label: isHi ? 'स्वतंत्र पहुंच' : 'Free Access' },
                ].map(s => (
                  <div key={s.num}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.6rem', fontWeight: 300, color: GOLD, lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(245,237,216,0.4)', letterSpacing: '0.08em', fontFamily: 'var(--font-inter)', marginTop: '0.2rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Bold CTA */}
              <Link href="/course" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.7rem',
                padding: '1.05rem 2.4rem', borderRadius: '6px',
                background: `linear-gradient(135deg, ${GOLD} 0%, #ffe89a 50%, #c49832 100%)`,
                color: '#061008', textDecoration: 'none', fontWeight: 800,
                fontFamily: isHi ? 'var(--font-hind)' : 'var(--font-inter)',
                fontSize: '0.98rem', letterSpacing: '0.04em',
                boxShadow: `0 8px 40px rgba(212,168,67,0.32)`,
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 56px rgba(212,168,67,0.48)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(212,168,67,0.32)'; }}
              >
                {isHi ? 'पाठ्यक्रम शुरू करें' : 'Begin the Course'} →
              </Link>
            </div>

            {/* RIGHT — chapter list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { n: '01', hi: 'स्वयं की खोज', en: 'The Discovery of Self' },
                { n: '02', hi: 'मन की परतें', en: 'Layers of the Mind' },
                { n: '03', hi: 'साक्षी बोध', en: 'Witness Awareness' },
                { n: '04', hi: 'अहंकार की जड़', en: 'The Root of Ego' },
                { n: '05', hi: 'माया का खेल', en: 'The Play of Maya' },
                { n: '06', hi: 'ध्यान का द्वार', en: 'Gateway of Meditation' },
                { n: '07', hi: 'मुक्ति की राह', en: 'Path of Liberation' },
                { n: '08', hi: 'निर्वाण सूत्र', en: 'Nirvan Sutra' },
              ].map((ch, i) => (
                <div key={ch.n} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.7rem 1rem', borderRadius: '8px',
                  border: `1px solid ${i === 5 ? 'rgba(212,168,67,0.22)' : 'rgba(212,168,67,0.07)'}`,
                  background: i === 5 ? 'rgba(212,168,67,0.07)' : 'rgba(5,14,7,0.55)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.56rem', color: 'rgba(212,168,67,0.45)', letterSpacing: '0.1em', minWidth: '18px' }}>{ch.n}</span>
                  <span style={{ flex: 1, fontFamily: isHi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.86rem', color: i === 5 ? GOLD : 'rgba(245,237,216,0.6)', fontWeight: i === 5 ? 600 : 400 }}>
                    {isHi ? ch.hi : ch.en}
                  </span>
                  {i === 5 && <span style={{ fontSize: '0.5rem', color: 'rgba(212,168,67,0.4)' }}>◈</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.35) 50%, transparent)' }} />
        <style>{`@media(max-width:768px){.sadh-course-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      <ContactSection lang={activeLang} />

      <style>{`
        @media (max-width: 700px) {
          .sadh-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
