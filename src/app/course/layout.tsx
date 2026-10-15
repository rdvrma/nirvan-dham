import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nirvan Sutra Course | Self-Inquiry & Advaita Vedanta | Nirvan Dham',
  description:
    'निर्वाण सूत्र — 17 चरणों, 170 प्रश्नों और तीन माह के निदिध्यासन का आध्यात्मिक पाठ्यक्रम। 11 भाषाओं में आत्म-जिज्ञासा की यात्रा।',
  keywords: [
    'Nirvan Sutra course', 'Advaita Vedanta', 'self-inquiry course', 'spiritual course Hindi',
    'Aadisatv teachings', 'Nirvan Dham course', 'Shravana Manana Nididhyasana',
    'आत्म-जिज्ञासा', 'निर्वाण सूत्र पाठ्यक्रम', 'अद्वैत वेदान्त',
  ],
  openGraph: {
    title: 'Nirvan Sutra Course | Nirvan Dham',
    description: 'A seventeen-stage journey of self-inquiry with guided practice in eleven languages.',
    url: 'https://nirvandham.in/course',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Nirvan Sutra Course | Nirvan Dham',
    description: 'Seventeen stages of self-inquiry with guided practice in eleven languages.',
  },
  alternates: { canonical: 'https://nirvandham.in/course' },
};

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
