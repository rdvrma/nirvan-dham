import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Nirvan Dham',
  description: 'Log in to access your Nirvan Sutra course progress and spiritual journey.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
