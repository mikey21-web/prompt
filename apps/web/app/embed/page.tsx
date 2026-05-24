import type { Metadata } from 'next';
import { EmbedTranslator } from './EmbedTranslator';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'PromptForge Embed',
  // Allow framing by anyone — this page IS the embed
  other: {
    'x-frame-options': 'ALLOWALL',
  },
};

export default function EmbedPage() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: 'transparent',
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <EmbedTranslator />
      </body>
    </html>
  );
}
