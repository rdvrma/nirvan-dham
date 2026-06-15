import type { Metadata } from 'next';
import FaqPage from '@/components/FaqPage';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'FAQ | Frequently Asked Questions about Nirvan Dham',
  description:
    'Answers to common questions about Nirvan Dham, Aadisatv, non-duality, Online Samvad, and guided meditation.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ | Nirvan Dham',
    description:
      'Answers to common questions about Nirvan Dham, Aadisatv, and non-duality.',
    url: '/faq',
    type: 'website',
  },
};

export default function FaqRoute() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Nirvan Dham?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nirvan Dham is not merely a physical place or institution. It is a silent, sacred space for seekers of awareness, non-duality, and self-inquiry.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who is Aadisatv?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Aadisatv is a spiritual guide who points seekers toward direct seeing: you are not merely the name, body, or mind — you are the awareness in which all appears.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Nirvan Sutra?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nirvan Sutra is the expression of Nirvan Dham. It is the collection of teachings, videos, and guidance that point to the ultimate truth.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Nirvan Dham a temple or ashram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, it is not a temple or a traditional ashram. There are no rituals performed here. It is a digital and physical (Bodhgaya) meeting point for those seeking truth.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is non-duality / Advaita?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Advaita translates to "not two". It is the understanding that the seer and the seen are not separate. There is only one boundless consciousness.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who can join Online Samvad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Any seeker who is sincere and deeply curious about the truth can apply for an Online Samvad (video session).',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens in Bodhgaya Samvad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In Bodhgaya Samvad, seekers sit in person with Aadisatv. It is a profound opportunity for silence, self-inquiry, and direct guidance.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there any fixed fee?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. There is no fee or mandatory payment for guidance. Nirvan Dham runs entirely on the voluntary support (donation) of seekers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can beginners start with guided meditation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, absolutely. The guided meditation (Sadhana) helps both beginners and experienced seekers rest into the silence within.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can international seekers connect?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'International seekers can watch the English teachings through Nirvan Sutra and apply for Online Samvad for one-on-one guidance.',
        },
      },
    ],
  };

  return (
    <>
      <SchemaOrg schema={faqSchema} />
      <FaqPage />
    </>
  );
}
