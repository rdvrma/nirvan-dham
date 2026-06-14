// This file provides generateStaticParams for the tatv/[slug] route
// It must be imported by the page.tsx server component wrapper
import { TATV_MEMBERS } from '@/lib/tatv-data';

export function generateStaticParams() {
  return TATV_MEMBERS.map((m) => ({ slug: m.slug }));
}
