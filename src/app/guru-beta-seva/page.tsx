import type { Metadata } from 'next';
import GuruBetaPage from '@/components/GuruBetaPage';

export const metadata: Metadata = {
  title: 'निर्वाण धाम एआई आध्यात्मिक साथी — सीमित गुरु बीटा आवेदन | Nirvan Dham',
  description: 'साधकों के कल्याण हेतु एक डिजिटल सेवा परीक्षण',
  robots: 'noindex, nofollow',
};

export default function GuruBetaRoute() {
  return <GuruBetaPage />;
}
