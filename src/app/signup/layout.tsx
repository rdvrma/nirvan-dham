import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Nirvan Dham',
  description: 'Create your Nirvan Dham account to begin the Nirvan Sutra spiritual journey.',
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
