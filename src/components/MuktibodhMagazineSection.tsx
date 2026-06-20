'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { hasMagazineAssets, isMagazineReleased, type Magazine } from '@/lib/library-data';

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

function isIssueReadable(issue: Magazine) {
  return hasMagazineAssets(issue);
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

function LaunchCelebration({ issue, hi }: { issue: Magazine; hi: boolean }) {
  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      maxWidth: '500px',
      border: '1px solid rgba(212,168,67,0.32)',
      borderRadius: '18px',
      padding: '1.6rem 1.4rem',
      background: 'linear-gradient(135deg, rgba(212,168,67,0.14) 0%, rgba(12,38,20,0.82) 50%, rgba(212,168,67,0.06) 100%)',
      boxShadow: '0 0 80px rgba(212,168,67,0.16), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 40px rgba(212,168,67,0.04)',
    }}>
      {/* Gold shimmer sweep */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(115deg, transparent 0%, rgba(255,232,164,0.14) 40%, transparent 72%)',
        animation: 'muktibodhLaunchSweep 3.4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Sparkle top-right */}
      <div style={{ position: 'absolute', top: '0.9rem', right: '1.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', animation: 'muktiStar1 2.2s ease-in-out infinite', display: 'inline-block' }}>✦</span>
        <span style={{ fontSize: '0.5rem', color: 'rgba(212,168,67,0.5)', animation: 'muktiStar2 1.8s ease-in-out infinite 0.4s', display: 'inline-block' }}>✦</span>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4a843', boxShadow: '0 0 18px #d4a843', animation: 'muktibodhLaunchPulse 1.8s ease-in-out infinite' }} />
      </div>

      {/* LIVE badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.28rem 0.8rem', borderRadius: '999px', border: '1px solid rgba(212,168,67,0.4)', background: 'rgba(212,168,67,0.1)', marginBottom: '1rem' }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#86efac', boxShadow: '0 0 8px #86efac', animation: 'muktibodhLaunchPulse 1.5s ease-in-out infinite' }} />
        <span style={{ fontSize: '0.54rem', color: '#d4a843', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'var(--font-inter)' }}>
          {hi ? 'नया अंक — अभी उपलब्ध' : 'New Issue — Live Now'}
        </span>
      </div>

      {/* Main headline */}
      <h3 style={{
        position: 'relative',
        margin: '0 0 0.5rem',
        color: 'var(--c-ivory)',
        fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
        fontSize: hi ? 'clamp(1.3rem,2.8vw,1.9rem)' : 'clamp(1.4rem,2.8vw,2.1rem)',
        lineHeight: 1.2,
        fontWeight: hi ? 750 : 500,
      }}>
        {hi
          ? `मुक्तिबोध ${formatIssue(issue, hi)} प्रकाशित हो गया`
          : `Muktibodh ${formatIssue(issue, hi)} is Now Live`}
      </h3>

      {/* Page count badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', fontSize: '0.6rem', color: '#d4a843', fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'var(--font-inter)' }}>
          69 {hi ? 'पृष्ठ' : 'PAGES'}
        </span>
        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)' }}>
          {hi ? '· जून 2026' : '· June 2026'}
        </span>
      </div>

      {/* Badhai / Congratulations message */}
      <p style={{
        position: 'relative',
        margin: '0 0 1.1rem',
        color: 'rgba(255,255,255,0.62)',
        fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
        fontSize: hi ? '0.88rem' : '0.82rem',
        lineHeight: 1.85,
        borderLeft: '2px solid rgba(212,168,67,0.3)',
        paddingLeft: '0.85rem',
      }}>
        {hi
          ? 'निर्वाण धाम परिवार की ओर से इस नए अंक के प्रकाशन पर हार्दिक बधाई! 🙏 यह अंक अद्वैत, साधना और प्रत्यक्ष आत्म-विचार की गहरी यात्रा लेकर आया है।'
          : 'Heartfelt congratulations from the Nirvan Dham family on this new edition! 🙏 This issue carries deep explorations of Advaita, living sadhana and direct self-inquiry.'}
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(212,168,67,0.3), transparent)', marginBottom: '1rem' }} />

      <p style={{ margin: 0, color: 'rgba(212,168,67,0.7)', fontSize: '0.72rem', fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)', letterSpacing: '0.04em' }}>
        {hi ? '✨ पढ़ें, डाउनलोड करें और साझा करें' : '✨ Read, download and share below'}
      </p>

      <style>{`
        @keyframes muktibodhLaunchSweep {
          0% { transform: translateX(-115%); opacity: 0; }
          22% { opacity: 1; }
          52% { transform: translateX(115%); opacity: 0.75; }
          100% { transform: translateX(115%); opacity: 0; }
        }
        @keyframes muktibodhLaunchPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.45); }
        }
        @keyframes muktiStar1 {
          0%, 100% { opacity: 0.3; transform: scale(0.85) rotate(0deg); color: #d4a843; }
          50% { opacity: 1; transform: scale(1.2) rotate(20deg); color: #ffe89a; }
        }
        @keyframes muktiStar2 {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}


function IssueActions({ issue, hi, prominent = false }: { issue: Magazine; hi: boolean; prominent?: boolean }) {
  const readable = useIssueAvailability(issue);
  const [copied, setCopied] = useState(false);
  const readHref = `/library/magazine/${issue.slug}/read`;

  const shareIssue = async () => {
    if (!readable) return;
    const url = `${window.location.origin}${readHref}`;
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

  const mainButtonStyle = {
    padding: prominent ? '0.9rem 1.75rem' : '0.65rem 1rem',
    background: readable ? 'rgba(212,168,67,0.14)' : 'rgba(255,255,255,0.035)',
    border: `1px solid ${readable ? 'rgba(212,168,67,0.45)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '8px',
    color: readable ? '#d4a843' : 'rgba(255,255,255,0.25)',
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
      ) : (
        <span style={mainButtonStyle}>
          {hi ? 'शीघ्र उपलब्ध' : 'Coming soon'}
        </span>
      )}

      {readable && issue.pdf && (
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

      {readable && (
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

function MagazineVideoMedallion({ hi }: { hi: boolean }) {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        width: '112%',
        height: '112%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,92,53,0.22) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: '-34px',
          background: 'radial-gradient(circle, rgba(212,168,67,0.12), transparent 66%)',
          filter: 'blur(26px)',
          pointerEvents: 'none',
          borderRadius: '50%',
        }} />
        <div style={{
          width: 'clamp(260px,32vw,430px)',
          aspectRatio: '1/1',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid rgba(212,168,67,0.18)',
          boxShadow: '0 0 86px rgba(26,92,53,0.34), 0 0 0 1px rgba(212,168,67,0.08), inset 0 0 64px rgba(212,168,67,0.04)',
          background: 'rgba(8,15,10,0.8)',
          position: 'relative',
        }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onCanPlay={() => setVideoLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 1s ease',
              transform: 'scale(1.05)',
            }}
          >
            <source src="/library/magazines/muktibodh-reading.mp4" type="video/mp4" />
          </video>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 18%, transparent 38%, rgba(6,14,8,0.15) 72%), linear-gradient(to top, rgba(8,15,10,0.72), transparent 38%)',
            pointerEvents: 'none',
          }} />
          {!videoLoaded && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,15,10,0.8)' }}>
              <div style={{ fontSize: '3rem', color: '#d4a843', opacity: 0.4, animation: 'magazineVideoPulse 2s ease-in-out infinite' }}>◎</div>
            </div>
          )}
        </div>

        <div style={{
          position: 'absolute',
          bottom: 'clamp(-1rem,2vw,-0.5rem)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(8,15,10,0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,168,67,0.16)',
          borderRadius: '999px',
          padding: '0.42rem 1.15rem',
          whiteSpace: 'nowrap',
        }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: 'rgba(212,168,67,0.65)', textTransform: 'uppercase' }}>
            {hi ? 'मुक्तिबोध अनुभव' : 'Muktibodh Experience'}
          </p>
        </div>

        <div style={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '50%',
          border: '1px solid rgba(212,168,67,0.08)',
          animation: 'magazineVideoOrbit 12s linear infinite',
          pointerEvents: 'none',
        }}>
          <div style={{ position: 'absolute', top: '5%', left: '50%', width: '6px', height: '6px', borderRadius: '50%', background: '#d4a843', marginLeft: '-3px', boxShadow: '0 0 8px #d4a843' }} />
        </div>
        <style>{`
          @keyframes magazineVideoOrbit { from { transform: rotate(0); } to { transform: rotate(360deg); } }
          @keyframes magazineVideoPulse { 0%,100% { opacity: 0.28; transform: scale(1); } 50% { opacity: 0.58; transform: scale(1.08); } }
        `}</style>
      </div>
    </div>
  );
}

function MagazineArchiveCard({ issue, hi }: { issue: Magazine; hi: boolean }) {
  const readable = useIssueAvailability(issue);
  const countdownTarget = issue.status === 'upcoming' ? issue.releaseDate : issue.nextIssueDate;
  const highlights = hi ? issue.highlightsHindi : issue.highlights;
  const body = hi ? (issue.teaserHindi || issue.descriptionHindi) : (issue.teaser || issue.description);
  const statusLabel = issue.status === 'upcoming'
    ? (hi ? 'आगामी' : 'Upcoming')
    : issue.status === 'archive'
      ? (hi ? 'संग्रह' : 'Archive')
      : (hi ? 'उपलब्ध' : 'Available');
  const displayStatusLabel = readable && issue.status === 'upcoming'
    ? (hi ? 'नया अंक' : 'New')
    : statusLabel;

  return (
    <article style={{
      background: 'rgba(8,20,11,0.74)',
      border: `1px solid ${readable ? 'rgba(212,168,67,0.18)' : 'rgba(212,168,67,0.09)'}`,
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
          color: readable ? '#d4a843' : 'rgba(255,255,255,0.38)',
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
  const sortedIssues = useMemo(
    () => [...issues].sort((a, b) => a.issueNumber - b.issueNumber),
    [issues],
  );
  const heroIssue = sortedIssues.find((issue) => issue.status === 'current') || sortedIssues.find(isIssueReadable) || sortedIssues[0];
  const upcomingIssue = sortedIssues.find((issue) => issue.status === 'upcoming');
  const [hasHeroIssueLaunched, setHasHeroIssueLaunched] = useState(false);
  const [releasedUpcomingIssueSlug, setReleasedUpcomingIssueSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!heroIssue) return;
    setHasHeroIssueLaunched(Date.now() >= new Date(heroIssue.launchDate).getTime());
  }, [heroIssue]);

  useEffect(() => {
    if (!upcomingIssue) {
      setReleasedUpcomingIssueSlug(null);
      return;
    }

    const tick = () => {
      setReleasedUpcomingIssueSlug(isMagazineReleased(upcomingIssue) && hasMagazineAssets(upcomingIssue) ? upcomingIssue.slug : null);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [upcomingIssue]);

  if (!heroIssue) return null;

  const launchedIssue = upcomingIssue && releasedUpcomingIssueSlug === upcomingIssue.slug ? upcomingIssue : null;
  const featuredIssue = launchedIssue || heroIssue;
  const countdownIssue = launchedIssue || upcomingIssue || heroIssue;
  const countdownTarget = upcomingIssue
    ? upcomingIssue.releaseDate
    : (isIssueReadable(heroIssue) || hasHeroIssueLaunched ? heroIssue.nextIssueDate : heroIssue.launchDate);
  const heroDescription = launchedIssue
    ? (hi
      ? 'मुक्तिबोध का नया अंक प्रकाशित हो चुका है। नए चिंतन, साधना और प्रत्यक्ष आत्म-विचार की यह यात्रा अब पढ़ने के लिए उपलब्ध है।'
      : 'The new Muktibodh issue is live now, opening fresh reflections on inquiry, sadhana and direct seeing.')
    : (hi ? heroIssue.descriptionHindi : heroIssue.description);

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #060e08 0%, #0d2014 35%, #071009 100%)',
      borderTop: '1px solid rgba(212,168,67,0.15)',
      borderBottom: '1px solid rgba(212,168,67,0.1)',
    }}>
      {[15, 40, 65, 88].map((pct, i) => (
        <div key={pct} style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${pct}%`,
          width: '1px',
          background: `linear-gradient(to bottom, transparent 0%, rgba(212,168,67,${0.04 + i * 0.02}) 50%, transparent 100%)`,
          animation: `magazineShimmerLine ${3 + i * 0.8}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.4}s`,
        }} />
      ))}
      <style>{`@keyframes magazineShimmerLine { from { opacity: 0.4; } to { opacity: 1; } }`}</style>

      <div style={{
        position: 'absolute',
        top: '40%',
        left: '35%',
        transform: 'translate(-50%,-50%)',
        width: '650px',
        height: '440px',
        background: 'radial-gradient(ellipse, rgba(212,168,67,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,5rem) clamp(3rem,6vw,5rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(3rem,6vw,6rem)', alignItems: 'center' }}>
          <div>
            <p style={{
              fontSize: '0.62rem',
              letterSpacing: '0.32em',
              color: '#d4a843',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '1rem',
              fontFamily: 'var(--font-inter)',
              opacity: 0.75,
            }}>
              {launchedIssue
                ? (hi ? `मासिक पत्रिका · ${formatIssue(launchedIssue, hi)} प्रकाशित` : `Monthly Magazine · ${formatIssue(launchedIssue, hi)} Live`)
                : hi
                  ? (isIssueReadable(heroIssue) ? `मासिक पत्रिका · ${formatIssue(heroIssue, hi)} उपलब्ध` : `मासिक पत्रिका · ${formatIssue(heroIssue, hi)}`)
                  : (isIssueReadable(heroIssue) ? `Monthly Magazine · ${formatIssue(heroIssue, hi)} Available` : `Monthly Magazine · ${formatIssue(heroIssue, hi)}`)}
            </p>

            <h2 style={{
              fontFamily: 'var(--font-hind)',
              fontSize: 'clamp(3.5rem,8vw,6.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              paddingBottom: '0.08em',
              color: '#d4a843',
              textShadow: '0 0 60px rgba(212,168,67,0.35), 0 0 120px rgba(212,168,67,0.15)',
              marginBottom: '0.3rem',
              letterSpacing: '-0.01em',
              display: 'block',
            }}>
              {featuredIssue.nameHindi}
            </h2>
            <p style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              color: 'rgba(212,168,67,0.38)',
              fontSize: '1.3rem',
              marginBottom: '1.75rem',
              letterSpacing: '0.04em',
            }}>
              {featuredIssue.name}
            </p>

            <p style={{
              fontSize: hi ? '0.95rem' : '0.9rem',
              color: 'rgba(255,255,255,0.42)',
              lineHeight: 1.9,
              maxWidth: '440px',
              marginBottom: '2.25rem',
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
            }}>
              {heroDescription}
            </p>

            <div style={{ marginBottom: '2rem' }}>
              {launchedIssue ? (
                <LaunchCelebration issue={launchedIssue} hi={hi} />
              ) : !upcomingIssue && heroIssue.status === 'current' ? (
                <LaunchCelebration issue={heroIssue} hi={hi} />
              ) : (
                <>
                  <p style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'rgba(212,168,67,0.45)',
                    marginBottom: '1rem',
                  }}>
                    {upcomingIssue
                      ? (hi ? `${formatIssue(countdownIssue, hi)} आने में` : `${formatIssue(countdownIssue, hi)} launches in`)
                      : (hi ? 'अगला अंक आने में' : 'Next issue in')}
                  </p>
                  <CountdownStrip targetDate={countdownTarget} hi={hi} />
                </>
              )}
            </div>

            <IssueActions issue={featuredIssue} hi={hi} prominent />
          </div>

          <MagazineVideoMedallion hi={hi} />
        </div>

        <div style={{ marginTop: 'clamp(3rem,6vw,5rem)', borderTop: '1px solid rgba(212,168,67,0.1)', paddingTop: 'clamp(2rem,4vw,3rem)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
            <div>
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
                {hi ? 'अंक और आगामी प्रकाशन' : 'Issues and upcoming releases'}
              </h3>
            </div>
            {upcomingIssue && (
              <p style={{
                maxWidth: '360px',
                color: 'rgba(255,255,255,0.38)',
                lineHeight: 1.65,
                fontSize: hi ? '0.78rem' : '0.74rem',
                fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                margin: 0,
              }}>
                {hi ? upcomingIssue.teaserHindi : upcomingIssue.teaser}
              </p>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}>
            {sortedIssues.map((issue) => (
              <MagazineArchiveCard key={issue.slug} issue={issue} hi={hi} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
