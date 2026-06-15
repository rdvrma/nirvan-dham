import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const channel = searchParams.get('channel') || 'hi';
  
  const channelId = channel === 'hi' 
    ? 'UCusQ7u0Axad_X0HJ1Mo1Itw' 
    : 'UCig7X3vdCgsNPnFzo6gbVnQ';

  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch RSS');

    const xml = await res.text();
    const videos = [];
    
    // Simple regex parsing for XML since this is a lightweight API route
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    
    let count = 0;
    while ((match = entryRegex.exec(xml)) !== null && count < 12) {
      const entry = match[1];
      const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const linkMatch = entry.match(/<link rel="alternate" href="(.*?)"\/>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      const mediaDescMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);

      if (videoIdMatch && titleMatch) {
        videos.push({
          id: videoIdMatch[1],
          title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
          link: linkMatch ? linkMatch[1] : `https://www.youtube.com/watch?v=${videoIdMatch[1]}`,
          published: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
          channel: channel === 'hi' ? 'Nirvan Dham' : 'The Oneness Project',
          handle: channel === 'hi' ? '@dhamnirvan' : '@TheOnenessProject',
          thumbnail: `https://i.ytimg.com/vi/${videoIdMatch[1]}/hqdefault.jpg`,
          description: mediaDescMatch ? mediaDescMatch[1].substring(0, 150) + '...' : '',
        });
        count++;
      }
    }

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Teachings RSS Error:', error);
    return NextResponse.json({ videos: [], error: 'Failed to fetch teachings' }, { status: 500 });
  }
}
