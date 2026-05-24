import { ImageResponse } from 'next/og';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@promptforge/convex/convex/_generated/api';
import { MODELS, type ModelId } from '@promptforge/core';

export const runtime = 'edge';
export const alt = 'PromptForge Showdown';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface ShareData {
  input: string;
  outputsJson: string;
}

export default async function OG({ params }: { params: { slug: string } }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    return new ImageResponse(<Fallback />, { ...size });
  }
  const client = new ConvexHttpClient(url);
  const share = (await client.query(api.shares.getShare, {
    slug: params.slug,
  })) as ShareData | null;
  if (!share) {
    return new ImageResponse(<Fallback />, { ...size });
  }

  let outputs: { target: ModelId; optimized: string; error?: string | null }[] = [];
  try {
    outputs = JSON.parse(share.outputsJson);
  } catch {
    /* fall through to fallback */
  }
  const visible = outputs.slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: 48,
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              background:
                'linear-gradient(90deg, #a78bfa 0%, #ec4899 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            ⚒ PromptForge
          </div>
          <div style={{ fontSize: 18, opacity: 0.7 }}>Showdown</div>
        </div>

        {/* Input */}
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            padding: '14px 18px',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            fontSize: 22,
            lineHeight: 1.3,
          }}
        >
          &ldquo;{share.input.slice(0, 120)}{share.input.length > 120 ? '…' : ''}&rdquo;
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 22,
            flex: 1,
          }}
        >
          {visible.map((o) => {
            const m = MODELS[o.target];
            return (
              <div
                key={o.target}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: 14,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#a78bfa',
                  }}
                >
                  {m?.label ?? o.target}
                </div>
                <div
                  style={{
                    display: 'flex',
                    marginTop: 8,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    lineHeight: 1.4,
                    color: 'rgba(255,255,255,0.85)',
                    flex: 1,
                    overflow: 'hidden',
                  }}
                >
                  {(o.optimized || o.error || '').slice(0, 280)}
                  {(o.optimized || o.error || '').length > 280 ? '…' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 22,
            fontSize: 18,
            opacity: 0.75,
          }}
        >
          <span>Same idea. Every model. Side by side.</span>
          <span>promptforge.dev</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

function Fallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a2e',
        color: 'white',
        fontSize: 64,
        fontWeight: 800,
      }}
    >
      ⚒ PromptForge
    </div>
  );
}
