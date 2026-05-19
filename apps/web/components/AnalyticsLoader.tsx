'use client';

import dynamic from 'next/dynamic';

/**
 * Vercel Analytics loader.
 *
 * The package may not be installed in every environment, so we dynamic-import
 * with an empty fallback. To activate analytics:
 *   npm install @vercel/analytics @vercel/speed-insights
 *
 * If the packages are missing, this renders nothing and the app keeps working.
 */
const Analytics = dynamic(
  () =>
    import('@vercel/analytics/react')
      .then((m) => m.Analytics)
      .catch(() => () => null),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () =>
    import('@vercel/speed-insights/next')
      .then((m) => m.SpeedInsights)
      .catch(() => () => null),
  { ssr: false }
);

export function AnalyticsLoader() {
  // Only emit beacons in production to avoid noise during dev/test.
  if (process.env.NODE_ENV !== 'production') return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
