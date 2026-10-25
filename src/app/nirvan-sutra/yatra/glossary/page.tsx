import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isLocale } from '@/course/nirvan-sutra/locales';

// Existing links lead to the complete reader, which seekers can open before enrolling.
export default async function GlossaryPage() {
  const saved = (await cookies()).get('ns_lang')?.value;
  redirect(`/course/glossary?lang=${isLocale(saved) ? saved : 'hi'}`);
}
