import { MagazineLab } from "@/components/magazine/MagazineLab";
import { issue01 } from "@/data/nirvana-sutra/issue-01";
import { readMagazineLocation } from "@/data/nirvana-sutra/navigation";
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
async function pageLanguage(params: Record<string, string | string[] | undefined>) {
  const saved = (await cookies()).get('nirvan-dham-language')?.value;
  return params.lang === 'en' || params.lang === 'hi' ? params.lang : saved === 'en' ? 'en' : 'hi';
}
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const language = await pageLanguage(await searchParams);
  return {
    title: language === 'en' ? 'Nirvan Sutra Patrika — Issue 01' : 'निर्वाण सूत्र पत्रिका — अंक ०१',
    description: language === 'en' ? 'A journey through inquiry, music, laughter, stories and silence. Read the English edition or listen to its fourteen narrated pieces.' : 'ज्ञान, गीत, हँसी, कथा और मौन की यात्रा। हिंदी में पढ़ें या चौदह रचनाएँ सुनें।',
    alternates: { canonical: '/patrika', languages: { hi: '/patrika?lang=hi', en: '/patrika?lang=en' } },
  };
}

export default async function PatrikaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") search.set(key, value);
  }
  const initialListening = params.listen === 'chapters' ? 'chapters' : params.listen === 'songs' ? 'songs' : undefined;
  const initialLanguage = await pageLanguage(params);
  return <MagazineLab initialLocation={readMagazineLocation(search.toString(), issue01)} initialListening={initialListening} initialLanguage={initialLanguage} />;
}
