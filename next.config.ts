import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.youtube-nocookie.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
      "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      // Existing redirects
      { source: '/samvad', destination: '/spiritual-guidance', permanent: true },
      { source: '/samvad/online', destination: '/online-samvad', permanent: true },
      { source: '/samvad/bodhgaya', destination: '/bodhgaya-samvad', permanent: true },
      { source: '/sadhana', destination: '/guided-meditation', permanent: true },
      { source: '/teachings', destination: '/nirvan-sutra', permanent: true },

      // Fix old URLs found in Google Search Console (88 unindexed pages)
      // Old /about page → new route
      { source: '/about', destination: '/about-aadisatv', permanent: true },
      // Old /seva → donation
      { source: '/seva', destination: '/donation', permanent: true },
      // Old /contact-us → spiritual-guidance
      { source: '/contact-us', destination: '/spiritual-guidance', permanent: true },
      // Old /guidance → spiritual-guidance
      { source: '/guidance', destination: '/spiritual-guidance', permanent: true },
      // Old /iccha-purti spelling → correct spelling
      { source: '/iccha-purti', destination: '/ichchha-poorti', permanent: true },
      // Old /ai-guide → guided-meditation (closest equivalent)
      { source: '/ai-guide', destination: '/guided-meditation', permanent: true },
      // Old /app → course page
      { source: '/app', destination: '/course', permanent: true },
      // Old /lw → home
      { source: '/lw', destination: '/', permanent: true },
      // Old blog slugs from previous site → blog index
      { source: '/blog/01-the-illusion-of-maya-five-deep-truths-that-can-change-the-way-you-see-the-world', destination: '/blog', permanent: true },
      { source: '/blog/02-the-compassion-of-the-guru-selfless-love-or-a-beautiful-bondage', destination: '/blog', permanent: true },
      { source: '/blog/03-atman-jiva-or-both-what-is-our-real-identity', destination: '/blog', permanent: true },
      { source: '/blog/04-is-this-life-also-a-dream-five-revolutionary-sutras-from-janaka-and-ashtavakra', destination: '/blog', permanent: true },
      { source: '/blog/05-god-is-love-disease-if-advaita-alone-is-truth-why-do-we-seek-medicine-in-duality', destination: '/blog', permanent: true },
      { source: '/blog/06-the-end-of-ignorance-effort-or-natural-recognition', destination: '/blog', permanent: true },
      { source: '/blog/07-your-nature-is-silence-then-who-takes-the-noise-of-the-world-to-be-real', destination: '/blog', permanent: true },
      { source: '/blog/08-self-guidance-and-the-search-for-truth-five-revolutionary-ideas', destination: '/blog', permanent: true },
    ];
  },
};

export default nextConfig;
