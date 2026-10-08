'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import NirvanSutraMagazineFeature from './NirvanSutraMagazineFeature';
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
  const sortedIssues = useMemo(() => [...issues].sort((a, b) => a.issueNumber - b.issueNumber), [issues]);
  const upcomingIssue = sortedIssues.find(issue => issue.status === 'upcoming');
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #060e08, #0d2014 35%, #071009)', borderTop: '1px solid rgba(212,168,67,0.15)', borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem,6vw,6rem) clamp(1.5rem,5vw,5rem) clamp(3rem,6vw,5rem)' }}>
        <NirvanSutraMagazineFeature hi={hi} />
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
