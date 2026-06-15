import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/samvad', destination: '/spiritual-guidance', permanent: true },
      { source: '/samvad/online', destination: '/online-samvad', permanent: true },
      { source: '/samvad/bodhgaya', destination: '/bodhgaya-samvad', permanent: true },
      { source: '/sadhana', destination: '/guided-meditation', permanent: true },
      { source: '/teachings', destination: '/nirvan-sutra', permanent: true },
    ];
  },
};

export default nextConfig;
