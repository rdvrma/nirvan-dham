// YouTube RSS fetcher — No API key needed!
// Automatically fetches latest video titles & descriptions from Aadisatv's channels

const CHANNELS = [
  {
    id: 'UCig7X3vdCgsNPnFzo6gbVnQ',
    handle: '@theonenessproject',
    name: 'The Oneness Project',
  },
  {
    id: 'UCusQ7u0Axad_X0HJ1Mo1Itw',
    handle: '@dhamnirvan',
    name: 'Dham Nirvan',
  },
];

export interface VideoEntry {
  title: string;
  description: string;
  link: string;
  published: string;
  channel: string;
}

// Cache: refresh every 6 hours
let cache: { data: VideoEntry[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export async function fetchYouTubeContext(): Promise<string> {
  // Return cached data if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return formatContextForGemini(cache.data);
  }

  const allVideos: VideoEntry[] = [];

  for (const channel of CHANNELS) {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
      const res = await fetch(rssUrl, {
        next: { revalidate: 21600 }, // Next.js cache: 6 hours
      });

      if (!res.ok) continue;

      const xml = await res.text();

      // Parse XML entries using regex (no XML library needed)
      const entries = xml.split('<entry>').slice(1);

      for (const entry of entries.slice(0, 10)) { // last 10 videos per channel
        const title = extractTag(entry, 'title');
        const link = extractAttr(entry, 'link', 'href');
        const published = extractTag(entry, 'published');
        const description = extractTag(entry, 'media:description') ||
                            extractTag(entry, 'description') || '';

        if (title && link) {
          allVideos.push({
            title,
            link,
            published: published.split('T')[0], // date only
            description: description.slice(0, 300), // first 300 chars
            channel: channel.name,
          });
        }
      }
    } catch (err) {
      console.error(`RSS fetch failed for ${channel.handle}:`, err);
    }
  }

  // Update cache
  if (allVideos.length > 0) {
    cache = { data: allVideos, fetchedAt: Date.now() };
  }

  return formatContextForGemini(allVideos);
}

function formatContextForGemini(videos: VideoEntry[]): string {
  if (videos.length === 0) return '';

  const lines = [
    '--- AADISATV\'S RECENT YOUTUBE TEACHINGS ---',
    'These are recent videos from Aadisatv\'s YouTube channels.',
    'Use this context to answer questions about his specific teachings.',
    '',
  ];

  const byChannel: Record<string, VideoEntry[]> = {};
  for (const v of videos) {
    if (!byChannel[v.channel]) byChannel[v.channel] = [];
    byChannel[v.channel].push(v);
  }

  for (const [channelName, vids] of Object.entries(byChannel)) {
    lines.push(`## ${channelName}`);
    for (const v of vids) {
      lines.push(`• [${v.published}] "${v.title}"`);
      lines.push(`  Link: ${v.link}`);
      if (v.description.trim()) {
        lines.push(`  About: ${v.description.trim()}`);
      }
      lines.push('');
    }
  }

  lines.push('--- END OF YOUTUBE CONTEXT ---');
  return lines.join('\n');
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  // Remove CDATA wrappers and HTML entities
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, '') // strip any HTML tags
    .trim();
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}
