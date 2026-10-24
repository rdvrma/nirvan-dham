import type { NextConfig } from "next";

// Local development against a Docker Supabase (scripts/nirvan-sutra/local-supabase.sh): allow that http origin. Production is unchanged.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const localSupabase = process.env.NODE_ENV !== 'production' && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(supabaseUrl) ? new URL(supabaseUrl).origin : null;

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
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.youtube-nocookie.com https://www.clarity.ms https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
      `connect-src 'self'${localSupabase ? ` ${localSupabase}` : ''} https://*.supabase.co https://generativelanguage.googleapis.com https://formspree.io https://*.clarity.ms https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(localSupabase ? [] : ["upgrade-insecure-requests"]),
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Course content is loaded through fs at runtime; the dynamic paths are not
  // discovered by Next's file tracer in Vercel Functions.
  outputFileTracingIncludes: {
    '/api/nirvan-sutra/**': ['./src/course/nirvan-sutra/content/**/*', './src/course/nirvan-sutra/locales/**/*'],
    '/nirvan-sutra/**': ['./src/course/nirvan-sutra/content/**/*', './src/course/nirvan-sutra/locales/**/*'],
  },

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
      // Old /app → course page
      { source: '/app', destination: '/course', permanent: true },
      // Old /lw → home
      { source: '/lw', destination: '/', permanent: true },
      // Only renamed old URLs redirect. Current article slugs must reach their post pages.
      { source: '/blog/05-god-is-love-disease-if-advaita-alone-is-truth-why-do-we-seek-medicine-in-duality', destination: '/blog/05-god-s-love-disease-if-advaita-alone-is-truth-why-do-we-seek-medicine-in-duality', permanent: true },
      { source: '/blog/08-self-guidance-and-the-search-for-truth-five-revolutionary-ideas', destination: '/blog/08-self-abidance-and-the-search-for-truth-five-revolutionary-ideas', permanent: true },

      // Library book slug renamed — Google had old URL indexed
      { source: '/library/tantra-a-confluence-of-paths', destination: '/library/tantra-confluence-of-paths', permanent: true },
      { source: '/library/tantra-a-confluence-of-paths/read', destination: '/library/tantra-confluence-of-paths/read', permanent: true },
    ];
  },
};

export default nextConfig;
