/** @type {import('next').NextConfig} */

// Content-Security-Policy that allows our integrated services:
//   - Clerk (auth + telemetry)
//   - Convex (websocket + HTTP API)
//   - Stripe (checkout iframe + JS)
//   - Vercel (Live, Analytics, Speed Insights)
//   - Sentry (ingest + replay)
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://js.stripe.com https://va.vercel-scripts.com https://*.sentry.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://*.convex.cloud wss://*.convex.cloud https://api.stripe.com https://vitals.vercel-insights.com https://vercel.live https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
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
