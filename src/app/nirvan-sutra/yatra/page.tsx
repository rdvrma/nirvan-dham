import { redirect } from 'next/navigation';
import { courseContext, BASE } from '@/course/nirvan-sutra/server/context';

// The entry of the journey: the language first, then the dashboard.
export default async function YatraEntry() {
  const { progress } = await courseContext();
  redirect(progress?.locale ? `${BASE}/dashboard` : `${BASE}/onboarding`);
}
