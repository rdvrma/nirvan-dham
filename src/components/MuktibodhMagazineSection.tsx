'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { hasMagazineAssets, isMagazineReleased, type Magazine } from '@/lib/library-data';
import NirvanSutraMagazineFeature from '@/components/NirvanSutraMagazineFeature';

function useCountdown(targetDate: string) {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(targetDate).getTime();
    const tick = () => setDiff(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (diff === null) return { days: 0, hrs: 0, mins: 0, secs: 0, launched: false, ready: false };

  return {
    days: Math.floor(diff / 86400000),
    hrs: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    launched: diff === 0,
    ready: true,
  };
}

function useIssueAvailability(issue: Magazine) {
  const [released, setReleased] = useState(issue.status !== 'upcoming');

  useEffect(() => {
    const tick = () => setReleased(isMagazineReleased(issue));
    tick();
    if (issue.status !== 'upcoming') return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [issue]);

  return hasMagazineAssets(issue) && released;
}

function formatIssue(issue: Magazine, hi: boolean) {
  return hi ? `अंक ${String(issue.issueNumber).padStart(2, '0')}` : `Issue ${String(issue.issueNumber).padStart(2, '0')}`;
}

function CountdownStrip({ targetDate, hi, compact = false }: { targetDate: string; hi: boolean; compact?: boolean }) {
  const countdown = useCountdown(targetDate);
  const units = [
    { v: countdown.days, l: hi ? 'दिन' : 'Days' },
    { v: countdown.hrs, l: hi ? 'घंटे' : 'Hrs' },
    { v: countdown.mins, l: hi ? 'मिनट' : 'Min' },
    { v: countdown.secs, l: hi ? 'सेकंड' : 'Sec' },
  ];

  return (
    <div style={{ display: 'flex', gap: compact ? '0.55rem' : 'clamp(0.6rem,2vw,1.5rem)', flexWrap: 'wrap' }}>
      {(countdown.ready ? units : units.map((unit) => ({ ...unit, v: 0 }))).map(({ v, l }) => (
        <div key={l} style={{ textAlign: 'center', minWidth: compact ? '42px' : '52px' }}>
          <div style={{
            fontSize: compact ? '1.35rem' : 'clamp(1.8rem,4.5vw,3rem)',
            fontWeight: 700,
            fontFamily: 'var(--font-cormorant)',
            fontVariantNumeric: 'tabular-nums',
            color: countdown.ready ? '#d4a843' : 'rgba(212,168,67,0.22)',
            textShadow: compact ? 'none' : '0 0 20px rgba(212,168,67,0.4)',
          }}>
            {countdown.ready ? String(v).padStart(2, '0') : '--'}
          </div>
          <div style={{
            fontSize: compact ? '0.48rem' : '0.55rem',
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: '0.2rem',
          }}>
            {l}
          </div>
        </div>
      ))}
    </div>
  );
}

function IssueActions({ issue, hi, prominent = false }: { issue: Magazine; hi: boolean; prominent?: boolean }) {
  const readable = useIssueAvailability(issue);
  // PDF-only availability: has pdf, is current/archive, may be placeholder (no page reader yet)
  const pdfAvailable = Boolean(issue.pdf) && issue.status !== 'upcoming';
  const [copied, setCopied] = useState(false);
  const readHref = `/library/magazine/${issue.slug}/read`;

  const shareIssue = async () => {
    const url = `${window.location.origin}${pdfAvailable ? issue.pdf! : readHref}`;
    const title = `${issue.name} ${issue.issue}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      setCopied(false);
    }
  };

  const isActive = readable || pdfAvailable;

  const mainButtonStyle = {
    padding: prominent ? '0.9rem 1.75rem' : '0.65rem 1rem',
    background: isActive ? 'rgba(212,168,67,0.14)' : 'rgba(255,255,255,0.035)',
    border: `1px solid ${isActive ? 'rgba(212,168,67,0.45)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '8px',
    color: isActive ? '#d4a843' : 'rgba(255,255,255,0.25)',
    fontSize: prominent ? '0.85rem' : '0.72rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
    textDecoration: 'none',
  };

  return (
    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {readable ? (
        <Link href={readHref} style={mainButtonStyle}>
          {hi ? `पढ़ें - ${formatIssue(issue, hi)}` : `Read ${formatIssue(issue, hi)}`}
        </Link>
      ) : pdfAvailable ? (
        /* Placeholder issues: direct PDF open instead of interactive reader */
        <a href={issue.pdf!} target="_blank" rel="noopener noreferrer" style={mainButtonStyle}>
          {hi ? `पढ़ें - ${formatIssue(issue, hi)}` : `Read ${formatIssue(issue, hi)}`}
        </a>
      ) : (
        <span style={mainButtonStyle}>
          {hi ? 'शीघ्र उपलब्ध' : 'Coming soon'}
        </span>
      )}

      {pdfAvailable && issue.pdf && (
        <a href={issue.pdf} download style={{
          padding: prominent ? '0.9rem 1.35rem' : '0.65rem 1rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.62)',
          fontSize: prominent ? '0.85rem' : '0.72rem',
          fontWeight: 650,
          fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
          textDecoration: 'none',
        }}>
          PDF
        </a>
      )}

      {isActive && (
        <button type="button" onClick={shareIssue} style={{
          padding: prominent ? '0.9rem 1.2rem' : '0.65rem 0.9rem',
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px',
          color: copied ? '#d4a843' : 'rgba(255,255,255,0.55)',
          fontSize: prominent ? '0.85rem' : '0.72rem',
          fontWeight: 650,
          fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
          cursor: 'pointer',
        }}>
          {copied ? (hi ? 'लिंक कॉपी' : 'Copied') : (hi ? 'शेयर' : 'Share')}
        </button>
      )}
    </div>
  );
}

function MagazineArchiveCard({ issue, hi }: { issue: Magazine; hi: boolean }) {
  const readable = useIssueAvailability(issue);
  // Also treat PDF-only placeholder issues as "active" for styling
  const isActive = readable || (Boolean(issue.pdf) && issue.status === 'current');
  const countdownTarget = issue.status === 'upcoming' ? issue.releaseDate : issue.nextIssueDate;
  const highlights = hi ? issue.highlightsHindi : issue.highlights;
  const body = hi ? (issue.teaserHindi || issue.descriptionHindi) : (issue.teaser || issue.description);
  const statusLabel = issue.status === 'upcoming'
    ? (hi ? 'आगामी' : 'Upcoming')
    : issue.status === 'archive'
      ? (hi ? 'संग्रह' : 'Archive')
      : (hi ? 'उपलब्ध' : 'Available');
  const displayStatusLabel = isActive && issue.status === 'upcoming'
    ? (hi ? 'नया अंक' : 'New')
    : statusLabel;

  return (
    <article style={{
      background: 'rgba(8,20,11,0.74)',
      border: `1px solid ${isActive ? 'rgba(212,168,67,0.18)' : 'rgba(212,168,67,0.09)'}`,
      borderRadius: '14px',
      padding: '1.2rem',
      minHeight: '260px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 18px 44px rgba(0,0,0,0.32)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.95rem' }}>
        <div>
          <p style={{ margin: '0 0 0.3rem', color: '#d4a843', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>
            {formatIssue(issue, hi)}
          </p>
          <h3 style={{
            margin: 0,
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontSize: hi ? '1.15rem' : '1.35rem',
            color: 'var(--c-ivory)',
            lineHeight: 1.25,
          }}>
            {hi ? issue.nameHindi : issue.name}
          </h3>
        </div>
        <span style={{
          border: '1px solid rgba(212,168,67,0.22)',
          borderRadius: '999px',
          padding: '0.25rem 0.65rem',
          color: isActive ? '#d4a843' : 'rgba(255,255,255,0.38)',
          fontSize: '0.58rem',
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}>
          {displayStatusLabel}
        </span>
      </div>

      <p style={{
        margin: '0 0 1rem',
        color: 'rgba(255,255,255,0.45)',
        lineHeight: 1.75,
        fontSize: hi ? '0.82rem' : '0.78rem',
        fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
      }}>
        {body}
      </p>

      {issue.status === 'upcoming' && !readable && (
        <div style={{ margin: '0.2rem 0 1.15rem' }}>
          <p style={{ margin: '0 0 0.65rem', color: 'rgba(212,168,67,0.45)', fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {hi ? 'प्रकाशन की उलटी गिनती' : 'Release countdown'}
          </p>
          <CountdownStrip targetDate={countdownTarget} hi={hi} compact />
        </div>
      )}

      {readable && highlights?.length ? (
        <div style={{ display: 'grid', gap: '0.45rem', marginBottom: '1rem' }}>
          {highlights.slice(0, 3).map((item) => (
            <div key={item} style={{
              color: 'rgba(255,255,255,0.44)',
              fontSize: hi ? '0.75rem' : '0.72rem',
              lineHeight: 1.45,
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
            }}>
              <span style={{ color: '#d4a843', marginRight: '0.45rem' }}>-</span>{item}
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ marginTop: 'auto' }}>
        <IssueActions issue={issue} hi={hi} />
      </div>
    </article>
  );
}

export default function MuktibodhMagazineSection({ hi, issues }: { hi: boolean; issues: Magazine[] }) {
  const sortedIssues = useMemo(() => [...issues].sort((a, b) => a.issueNumber - b.issueNumber), [issues]);
  const featuredIssue = useMemo(() =>
    sortedIssues.find(i => i.status === 'current') ?? sortedIssues[sortedIssues.length - 1],
    [sortedIssues]
  );
  const archiveIssues = useMemo(() =>
    sortedIssues.filter(i => i.slug !== featuredIssue?.slug),
    [sortedIssues, featuredIssue]
  );

  return (
    <>
    <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #060e08, #0d2014 35%, #071009)', borderTop: '1px solid rgba(212,168,67,0.15)', borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem,6vw,6rem) clamp(1.5rem,5vw,5rem) clamp(3rem,6vw,5rem)' }}>

        {/* ── Featured Current Issue (Muktibodh hero) ── */}
        {featuredIssue && <MuktibodhFeaturedIssue issue={featuredIssue} hi={hi} />}

        {/* ── Archive: older issues ── */}
        {archiveIssues.length > 0 && (
          <div style={{ marginTop: 'clamp(3rem,6vw,5rem)', borderTop: '1px solid rgba(212,168,67,0.1)', paddingTop: 'clamp(2rem,4vw,3rem)' }}>
            <div style={{ marginBottom: '1.4rem' }}>
              <p style={{ fontSize: '0.58rem', letterSpacing: '0.24em', color: '#d4a843', textTransform: 'uppercase', fontWeight: 800, opacity: 0.78, margin: '0 0 0.5rem' }}>
                {hi ? 'मुक्तिबोध संग्रह' : 'Muktibodh Archive'}
              </p>
              <h3 style={{
                fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                fontSize: 'clamp(1.5rem,3vw,2.35rem)',
                fontWeight: hi ? 650 : 400,
                color: 'var(--c-ivory)',
                margin: 0,
              }}>
                {hi ? 'पिछले अंक' : 'Previous issues'}
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {archiveIssues.map((issue) => (
                <MagazineArchiveCard key={issue.slug} issue={issue} hi={hi} />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>

    {/* Nirvan Sutra Patrika — interactive magazine */}
    <section style={{
      background: 'linear-gradient(145deg,#050c07,#0a1a0d 40%,#060e08)',
      borderTop: '1px solid rgba(212,168,67,0.08)',
      borderBottom: '1px solid rgba(212,168,67,0.08)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem,6vw,6rem) clamp(1.5rem,5vw,5rem) clamp(3rem,6vw,5rem)' }}>
        <div style={{ marginBottom: 'clamp(2rem,4vw,3.5rem)' }}>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.24em', color: '#d4a843', textTransform: 'uppercase', fontWeight: 800, opacity: 0.65, margin: '0 0 0.5rem', fontFamily: 'var(--font-inter)' }}>
            {hi ? 'सजीव डिजिटल पत्रिका' : 'Interactive Digital Magazine'}
          </p>
          <h3 style={{
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontSize: 'clamp(1.5rem,3vw,2.35rem)',
            fontWeight: hi ? 650 : 400,
            color: 'var(--c-ivory)',
            margin: 0,
          }}>
            {hi ? 'निर्वाण सूत्र पत्रिका' : 'Nirvan Sutra Patrika'}
          </h3>
        </div>
        <NirvanSutraMagazineFeature hi={hi} />
      </div>
    </section>
    </>
  );
}

// ── Featured hero for the current Muktibodh issue ───────────
function MuktibodhFeaturedIssue({ issue, hi }: { issue: Magazine; hi: boolean }) {
  const pdfAvailable = Boolean(issue.pdf) && issue.status !== 'upcoming';
  const readHref = `/library/magazine/${issue.slug}/read`;
  const highlights = hi ? issue.highlightsHindi : issue.highlights;
  const name       = hi ? issue.nameHindi : issue.name;
  const intro      = hi ? (issue.descriptionHindi || issue.teaserHindi) : (issue.description || issue.teaser);
  const issueLabel = hi ? `नवंबर २०२६ · अंक ${String(issue.issueNumber).padStart(2, '0')}` : `November 2026 · Issue ${String(issue.issueNumber).padStart(2, '0')}`;
  const tagline    = hi ? 'चेतना का मासिक सूत्र' : 'Monthly journal of consciousness';

  return (
    <div className="mukti-feature" aria-labelledby="mukti-feature-title">

      {/* ── Left: copy ── */}
      <div className="mukti-feature-copy">
        <p className="mukti-feature-kicker">{issueLabel}</p>
        <h2 id="mukti-feature-title">
          {name}<span>{tagline}</span>
        </h2>
        <p className="mukti-feature-intro">{intro}</p>

        {highlights?.length ? (
          <div className="mukti-feature-note">
            <p>{hi ? 'इस अंक में' : 'Inside this issue'}</p>
            <ul aria-label={hi ? 'अंक की विशेषताएँ' : 'Issue highlights'}>
              {highlights.slice(0, 3).map((h) => <li key={h}>{h}</li>)}
            </ul>
          </div>
        ) : null}

        <div className="mukti-feature-actions">
          {pdfAvailable && (
            <a href={readHref} className="mukti-feature-primary">
              {hi ? `अंक ${String(issue.issueNumber).padStart(2, '0')} पढ़ें` : `Read Issue ${String(issue.issueNumber).padStart(2, '0')}`}
              {' '}<span aria-hidden="true">↗</span>
            </a>
          )}
          {pdfAvailable && issue.pdf && (
            <a href={issue.pdf} download>
              {hi ? 'PDF डाउनलोड' : 'Download PDF'} <span aria-hidden="true">↓</span>
            </a>
          )}
        </div>
        <p className="mukti-feature-access">
          {hi ? 'निःशुल्क · बिना लॉगिन पढ़ें' : 'Free · Read without signing in'}
        </p>
      </div>

      {/* ── Right: book mockup ── */}
      <a href={pdfAvailable ? readHref : '#'} target="_blank" rel="noopener noreferrer"
        className="mukti-feature-art"
        aria-label={hi ? 'मुक्तिबोध अंक खोलें' : 'Open Muktibodh issue'}>
        <div className="mukti-feature-book">
          <div className="mukti-feature-book-top">
            <span>{hi ? 'निर्वाण धाम' : 'NIRVAN DHAM'}</span>
            <span>{hi ? `अंक ${String(issue.issueNumber).padStart(2, '0')}` : `ISSUE ${String(issue.issueNumber).padStart(2, '0')}`}</span>
          </div>
          <p className="mukti-feature-book-name" lang={hi ? 'hi' : 'en'}>
            {hi ? 'मुक्तिबोध' : 'Muktibodh'}
            <span>{hi ? 'नवंबर २०२६' : 'November 2026'}</span>
          </p>
          <p className="mukti-feature-book-line" lang={hi ? 'hi' : 'en'}>
            {hi ? 'चेतना · अन्वेषण · जीवंत साधना' : 'Consciousness · Inquiry · Sadhana'}
          </p>
          <svg viewBox="0 0 420 200" fill="none" aria-hidden="true">
            <circle cx="210" cy="72" r="44" stroke="#d4a843" strokeOpacity=".16" strokeWidth="1"/>
            <circle cx="210" cy="72" r="28" stroke="#d4a843" strokeOpacity=".22" strokeWidth="0.5"/>
            <circle cx="210" cy="72" r="9"  fill="#d4a843" fillOpacity=".18"/>
            <path d="M30 158 Q110 112 210 142 T390 122" stroke="#d4a843" strokeOpacity=".28" strokeWidth="1.2" fill="none"/>
            <path d="M30 175 Q125 150 210 162 T390 148" stroke="#d4a843" strokeOpacity=".1"  strokeWidth="1"   fill="none"/>
            {([[75,152],[145,128],[210,146],[278,130],[345,148]] as [number,number][]).map(([x,y],i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="6.5" fill="#15291b" stroke="#b89a50" strokeOpacity=".5" strokeWidth="0.8"/>
                <circle cx={x} cy={y} r="2.2" fill="#d9bb72"/>
              </g>
            ))}
          </svg>
          <div className="mukti-feature-book-bottom">
            <span>{hi ? 'मासिक · चेतना की पत्रिका' : 'Monthly · Journal of Consciousness'}</span>
            <span aria-hidden="true">↗</span>
          </div>
        </div>
        <span className="mukti-feature-art-caption">
          {hi ? 'PDF · बिना लॉगिन पढ़ें' : 'PDF · Read without signing in'}
        </span>
      </a>

      <style jsx>{`
        .mukti-feature{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(2rem,5vw,5rem);align-items:center}
        .mukti-feature-kicker{font:700 .64rem/1.8 var(--font-inter);letter-spacing:.2em;color:#c7a24e;margin:0 0 1rem;text-transform:uppercase}
        .mukti-feature h2{font-family:${hi ? 'var(--font-hind)' : 'var(--font-cormorant)'};font-weight:${hi ? '650' : '500'};font-size:clamp(3rem,5.5vw,5rem);line-height:1.15;color:#dfb952;margin:0 0 .7rem;text-shadow:0 0 70px #d4a84322}
        .mukti-feature h2 span{display:block;color:#f1e5c9;font-size:.62em;margin-top:.25rem}
        .mukti-feature-intro{font-family:${hi ? 'var(--font-hind)' : 'var(--font-inter)'};font-size:.92rem;line-height:1.95;color:#b9bdaa;margin:0 0 1.5rem;max-width:32rem}
        .mukti-feature-note{padding:1.2rem 1.4rem;border:1px solid #d4a84340;border-radius:12px;background:linear-gradient(135deg,#d4a8430a,#17372155);margin-bottom:1.5rem}
        .mukti-feature-note>p:first-child{font-family:var(--font-hind);font-size:.72rem;color:#d9b65e;margin:0 0 .6rem}
        .mukti-feature-note ul{list-style:none;margin:0;padding:0;display:grid;gap:.4rem}
        .mukti-feature-note li{font-family:${hi ? 'var(--font-hind)' : 'var(--font-inter)'};font-size:${hi ? '.8rem' : '.76rem'};color:rgba(255,255,255,.45);line-height:1.5;padding-left:1.1rem;position:relative}
        .mukti-feature-note li::before{content:"—";color:#d4a843;position:absolute;left:0}
        .mukti-feature-actions{display:flex;flex-wrap:wrap;gap:.65rem;margin-bottom:.7rem}
        .mukti-feature-actions :global(a){display:inline-flex;align-items:center;gap:.8rem;min-height:48px;padding:.8rem 1.1rem;text-decoration:none;border:1px solid #d4a8434d;border-radius:7px;color:#dcca9b;font-family:${hi ? 'var(--font-hind)' : 'var(--font-inter)'};font-size:.84rem;background:#d4a84308;transition:background .2s,border-color .2s}
        .mukti-feature-actions :global(a.mukti-feature-primary){background:#d4a843;color:#112218;font-weight:700;border-color:#d4a843}
        .mukti-feature-actions :global(a:hover){background:#d4a8432b;border-color:#e8c060}
        .mukti-feature-actions :global(a.mukti-feature-primary:hover){background:#e8c060}
        .mukti-feature-access{font:400 .72rem/1.8 var(--font-hind);color:#84967e;margin:0}
        :global(.mukti-feature-art){display:block;text-decoration:none;color:#e9dcb8;perspective:1200px}
        .mukti-feature-book{position:relative;border:1px solid #bca26070;border-radius:4px 15px 15px 4px;padding:1.5rem 1.5rem 1rem;background:linear-gradient(135deg,#182a20,#09160f);box-shadow:-8px 5px 0 #293324,-12px 8px 0 #132116,0 30px 90px #0007;transform:rotate(2deg);transition:transform .5s}
        :global(.mukti-feature-art:hover) .mukti-feature-book{transform:rotate(0) translateY(-5px)}
        .mukti-feature-book::before{content:"";position:absolute;top:0;bottom:0;left:10px;width:1px;background:#d7b35433}
        .mukti-feature-book-top,.mukti-feature-book-bottom{display:flex;align-items:center;justify-content:space-between;gap:1rem;font-size:.64rem;letter-spacing:.1em;color:#bca769}
        .mukti-feature-book-name{font-family:var(--font-hind);font-size:clamp(2.2rem,3.5vw,3.2rem);font-weight:600;line-height:1.3;margin:1.5rem 0 .5rem;text-align:center;color:#e1c67d}
        .mukti-feature-book-name span{display:block;font-size:.5em;color:#f1e4c6;letter-spacing:.08em}
        .mukti-feature-book-line{font-family:var(--font-hind);font-size:.68rem;text-align:center;color:#a6b49b}
        .mukti-feature-book svg{display:block;width:100%;height:auto;margin:.8rem 0}
        .mukti-feature-book-bottom{padding-top:.8rem;border-top:1px solid #d7b35430;line-height:1.7}
        .mukti-feature-art-caption{display:block;text-align:center;font:400 .72rem/1.8 var(--font-hind);color:#a5ae94;margin-top:1.5rem}
        :global(.mukti-feature-art:focus-visible){outline:2px solid #eac86f;outline-offset:6px}
        @media(max-width:760px){.mukti-feature{grid-template-columns:1fr;gap:2.5rem}.mukti-feature h2{font-size:clamp(2.7rem,10vw,4.5rem)}:global(.mukti-feature-art){width:min(100%,390px);margin:0 auto}.mukti-feature-book{transform:none}}
        @media(prefers-reduced-motion:reduce){.mukti-feature-book{transform:none;transition:none}:global(.mukti-feature-art:hover) .mukti-feature-book{transform:none}}
      `}</style>
    </div>
  );
}
