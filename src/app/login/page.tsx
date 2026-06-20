'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseAuthShell, authStyles } from '@/components/CourseAuthShell';
import { createClient } from '@/utils/supabase/client';

function safeNext(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/course';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('error') ?? '');
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function signInWithGoogle() {
    setError('');
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <CourseAuthShell title="Welcome back" subtitle="Continue your Nirvan Sutra journey from where you last paused.">
      <form onSubmit={signIn} style={{ display: 'grid', gap: '1.15rem' }}>
        <label><span style={authStyles.label}>Email</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} style={authStyles.input} /></label>
        <label><span style={authStyles.label}>Password</span><input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} style={authStyles.input} /></label>
        {error && <p role="alert" style={{ margin: 0, padding: '0.75rem', border: '1px solid rgba(248,113,113,0.35)', color: '#fca5a5', background: 'rgba(127,29,29,0.18)', borderRadius: '7px', fontFamily: 'var(--font-inter)', fontSize: '0.82rem' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ ...authStyles.primaryButton, opacity: loading ? 0.65 : 1 }}>{loading ? 'Entering...' : 'Continue to Course'}</button>
      </form>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1.5rem 0' }}><span style={{ height: 1, flex: 1, background: 'rgba(212,168,67,0.16)' }} /><span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: 'rgba(245,237,216,0.4)' }}>OR</span><span style={{ height: 1, flex: 1, background: 'rgba(212,168,67,0.16)' }} /></div>
      <button onClick={signInWithGoogle} disabled={loading} style={{ ...authStyles.secondaryButton, opacity: loading ? 0.65 : 1 }}>Continue with Google</button>
      <p style={{ margin: '1.6rem 0 0', color: 'rgba(245,237,216,0.55)', fontFamily: 'var(--font-inter)', fontSize: '0.82rem', textAlign: 'center' }}>New seeker? <Link href={`/signup?next=${encodeURIComponent(next)}`} style={{ color: '#d4a843' }}>Create your account</Link></p>
      <p style={{ margin: '1rem 0 0', color: 'rgba(245,237,216,0.36)', fontFamily: 'var(--font-inter)', fontSize: '0.7rem', lineHeight: 1.5, textAlign: 'center' }}>Your secure session remains active on this device.</p>
    </CourseAuthShell>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<CourseAuthShell title="Welcome back" subtitle="Preparing your course access..."><div /></CourseAuthShell>}><LoginForm /></Suspense>;
}
