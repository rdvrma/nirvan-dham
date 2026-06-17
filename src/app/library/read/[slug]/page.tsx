import { redirect } from 'next/navigation';

interface LegacyReaderRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LegacyReaderRoute({ params }: LegacyReaderRouteProps) {
  const { slug } = await params;
  redirect(`/library/${slug}/read`);
}
