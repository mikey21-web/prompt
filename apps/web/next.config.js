/** @type {import('next').NextConfig} */

// Security headers applied to every response. Tightened CSP can be added
// once we know the full set of script/connect origins (Clerk, Convex,
// Stripe, Vercel Analytics, Sentry).
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // HSTS only kicks in on HTTPS responses, so leaving it on in dev is safe.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@promptforge/core',
    '@promptforge/ui',
    '@promptforge/convex',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
