import type { Language } from '@/lib/i18n';

/** Keep the existing lead inbox and carry the ad's source URL into the request. */
export async function sendMeetingRequest(
  data: FormData,
  context: { language: Language; sourceUrl: string },
  fetchRequest: typeof fetch = fetch,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetchRequest('https://formspree.io/f/xqeogwza', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ ...Object.fromEntries(data.entries()),
        _subject: '[Bodhgaya Samvad] — Nirvan Dham', _source_page: 'Bodhgaya Samvad',
        _source_url: context.sourceUrl, _language: context.language,
        _submitted_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error('Meeting request rejected');
  } finally {
    clearTimeout(timeout);
  }
}
