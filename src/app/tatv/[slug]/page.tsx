import { TATV_MEMBERS } from '@/lib/tatv-data';
import TatvSlugClient from '@/components/TatvSlugClient';

export function generateStaticParams() {
  return TATV_MEMBERS.map((m) => ({ slug: m.slug }));
}

export default function TatvPage() {
  return <TatvSlugClient />;
}
