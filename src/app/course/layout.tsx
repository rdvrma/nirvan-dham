import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nirvan Sutra Course | Self-Inquiry & Advaita Vedanta | Nirvan Dham',
  description:
    'निर्वाण सूत्र — एक पूर्ण आध्यात्मिक पाठ्यक्रम। 8 अध्याय, 3 चरण (श्रवण, मनन, निदिध्यासन), 3 भाषाएँ। आत्म-जिज्ञासा और अद्वैत वेदान्त की प्रत्यक्ष यात्रा — आदिसत्व के साथ।',
  keywords: [
    'Nirvan Sutra course', 'Advaita Vedanta', 'self-inquiry course', 'spiritual course Hindi',
    'Aadisatv teachings', 'Nirvan Dham course', 'Shravana Manana Nididhyasana',
    'आत्म-जिज्ञासा', 'निर्वाण सूत्र पाठ्यक्रम', 'अद्वैत वेदान्त',
  ],
  openGraph: {
    title: 'Nirvan Sutra Course | Nirvan Dham',
    description: 'A complete spiritual journey — 8 chapters, 3 stages, 3 languages. Direct self-inquiry with Aadisatv.',
    url: 'https://nirvandham.in/course',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Nirvan Sutra Course | Nirvan Dham',
    description: 'A complete spiritual journey — 8 chapters, 3 stages, 3 languages.',
  },
  alternates: { canonical: 'https://nirvandham.in/course' },
};

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
