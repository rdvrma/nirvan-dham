'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseAuthShell, authStyles } from '@/components/CourseAuthShell';
import { createClient } from '@/utils/supabase/client';

function safeNext(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/course';
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if Supabase is properly configured
  const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isConfigured && !error) {
    setError('System Configuration Error: Database connection keys are missing. Please configure Vercel Environment Variables.');
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const supabase = createClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone }, emailRedirectTo },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.replace(next);
      router.refresh();
      return;
    }
    setMessage('Your account is ready. Please confirm the verification email, then sign in to begin.');
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
    <CourseAuthShell title="Begin the journey" subtitle="Create your seeker account to keep your learning path safe and continuous.">
      <form onSubmit={signUp} style={{ display: 'grid', gap: '1rem' }}>
        <label><span style={authStyles.label}>Name</span><input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} style={authStyles.input} /></label>
        <label><span style={authStyles.label}>Email</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} style={authStyles.input} /></label>
        <label><span style={authStyles.label}>Phone <em style={{ fontWeight: 400, opacity: 0.65 }}>(optional)</em></span><input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} style={authStyles.input} /></label>
        <label><span style={authStyles.label}>Password</span><input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} style={authStyles.input} /></label>
        {error && <p role="alert" style={{ margin: 0, padding: '0.75rem', border: '1px solid rgba(248,113,113,0.35)', color: '#fca5a5', background: 'rgba(127,29,29,0.18)', borderRadius: '7px', fontFamily: 'var(--font-inter)', fontSize: '0.82rem' }}>{error}</p>}
        {message && <p role="status" style={{ margin: 0, padding: '0.75rem', border: '1px solid rgba(74,222,128,0.35)', color: '#bbf7d0', background: 'rgba(20,83,45,0.16)', borderRadius: '7px', fontFamily: 'var(--font-inter)', fontSize: '0.82rem', lineHeight: 1.55 }}>{message}</p>}
        <button type="submit" disabled={loading} style={{ ...authStyles.primaryButton, opacity: loading ? 0.65 : 1 }}>{loading ? 'Creating account...' : 'Create Account'}</button>
      </form>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1.5rem 0' }}><span style={{ height: 1, flex: 1, background: 'rgba(212,168,67,0.16)' }} /><span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: 'rgba(245,237,216,0.4)' }}>OR</span><span style={{ height: 1, flex: 1, background: 'rgba(212,168,67,0.16)' }} /></div>
      <button onClick={signInWithGoogle} disabled={loading} style={{ ...authStyles.secondaryButton, opacity: loading ? 0.65 : 1 }}>Continue with Google</button>
      <p style={{ margin: '1.6rem 0 0', color: 'rgba(245,237,216,0.55)', fontFamily: 'var(--font-inter)', fontSize: '0.82rem', textAlign: 'center' }}>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} style={{ color: '#d4a843' }}>Sign in</Link></p>
    </CourseAuthShell>
  );
}

export default function SignupPage() {
  return <Suspense fallback={<CourseAuthShell title="Begin the journey" subtitle="Preparing your course access..."><div /></CourseAuthShell>}><SignupForm /></Suspense>;
}
