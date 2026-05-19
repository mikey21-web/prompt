'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

/**
 * Vercel Analytics + Speed Insights loader.
 *
 * Beacons only fire when deployed on Vercel. Locally and in test the
 * components mount but their network calls are skipped by the SDKs, so
 * there's no dev/prod divergence to worry about.
 */
export function AnalyticsLoader() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
