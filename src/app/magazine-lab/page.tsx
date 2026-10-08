import { redirect } from 'next/navigation';

/** Keep existing magazine preview / bookmarked links working at the public reader. */
export default async function MagazinePreviewRedirect({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') query.set(key, value);
  }
  redirect(`/patrika${query.size ? `?${query}` : ''}`);
}
