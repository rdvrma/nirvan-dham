import Link from 'next/link';
import type { ReactNode } from 'react';

const GOLD = '#d4a843';
const IVORY = 'rgba(245,237,216,1)';
const MUTED = 'rgba(245,237,216,0.58)';

export function CourseAuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', background: '#061008', color: IVORY, display: 'grid', placeItems: 'center', padding: '2rem 1.25rem', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', width: 'min(82vw,780px)', aspectRatio: '1', border: '1px solid rgba(212,168,67,0.1)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <div aria-hidden style={{ position: 'absolute', width: 'min(58vw,520px)', aspectRatio: '1', border: '1px solid rgba(212,168,67,0.08)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <section style={{ width: '100%', maxWidth: '470px', position: 'relative', zIndex: 1, border: '1px solid rgba(212,168,67,0.22)', background: 'linear-gradient(145deg, rgba(18,36,21,0.92), rgba(6,16,8,0.96))', boxShadow: '0 28px 80px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.03)', padding: 'clamp(1.75rem,5vw,3rem)', borderRadius: '12px', backdropFilter: 'blur(18px)' }}>
        <Link href="/course" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: MUTED, fontFamily: 'var(--font-inter)', fontSize: '0.78rem', textDecoration: 'none', marginBottom: '2.6rem' }}>← Nirvan Sutra Course</Link>
        <p style={{ color: GOLD, fontFamily: 'var(--font-inter)', fontSize: '0.66rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.8rem', fontWeight: 700 }}>Nirvan Dham</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.3rem,8vw,3.3rem)', lineHeight: 1, fontWeight: 400, margin: 0, color: IVORY }}>{title}</h1>
        <p style={{ fontFamily: 'var(--font-inter)', color: MUTED, fontSize: '0.92rem', lineHeight: 1.7, margin: '1rem 0 2rem' }}>{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

export const authStyles = {
  input: { width: '100%', boxSizing: 'border-box' as const, padding: '0.9rem 1rem', borderRadius: '7px', border: '1px solid rgba(212,168,67,0.22)', background: 'rgba(4,12,6,0.72)', color: 'rgba(245,237,216,1)', fontFamily: 'var(--font-inter)', fontSize: '0.92rem', outline: 'none' },
  label: { display: 'block', color: 'rgba(245,237,216,0.72)', fontFamily: 'var(--font-inter)', fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.5rem' },
  primaryButton: { width: '100%', border: 0, borderRadius: '7px', padding: '0.95rem 1rem', background: '#d4a843', color: '#061008', fontFamily: 'var(--font-inter)', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(212,168,67,0.2)' },
  secondaryButton: { width: '100%', border: '1px solid rgba(212,168,67,0.25)', borderRadius: '7px', padding: '0.9rem 1rem', background: 'rgba(212,168,67,0.04)', color: 'rgba(245,237,216,1)', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },
};
