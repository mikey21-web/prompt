'use client';

const MODELS = [
  'Claude Sonnet 4.5',
  'GPT-4o',
  'Gemini 2.5 Pro',
  'Midjourney v7',
  'Sora 2',
  'DALL·E 3',
  'Stable Diffusion XL',
  'Runway Gen-3',
  'Veo 3',
  'Suno v4',
  'ElevenLabs',
  'Cursor',
  'Perplexity',
];

export function ModelMarquee() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <div className="flex gap-2 animate-marquee whitespace-nowrap">
        {[...MODELS, ...MODELS].map((m, i) => (
          <span
            key={`${m}-${i}`}
            aria-hidden={i >= MODELS.length}
            className="shrink-0 rounded-full border border-[oklch(88%_0.005_270)] bg-white px-4 py-1.5 text-xs font-medium text-[oklch(35%_0.008_270)]"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
