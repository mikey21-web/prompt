'use client';

const MODELS = [
  { name: 'Claude Sonnet 4.5', short: 'CL' },
  { name: 'GPT-4o', short: '4o' },
  { name: 'Gemini 2.5 Pro', short: 'GM' },
  { name: 'Midjourney v7', short: 'MJ' },
  { name: 'Sora 2', short: 'SR' },
  { name: 'DALL·E 3', short: 'DL' },
  { name: 'Stable Diffusion', short: 'SD' },
  { name: 'Runway Gen-3', short: 'RW' },
  { name: 'Veo 3', short: 'V3' },
  { name: 'Suno v4', short: 'SU' },
  { name: 'ElevenLabs', short: 'EL' },
  { name: 'Cursor', short: 'CR' },
  { name: 'Perplexity', short: 'PX' },
];

/**
 * Continuously-scrolling marquee of model logo pills. Two duplicated
 * tracks produce a seamless loop. Edges fade via gradient mask so
 * items don't pop in/out abruptly.
 */
export function ModelMarquee() {
  return (
    <div
      className="relative overflow-hidden py-6"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      <div className="flex gap-3 animate-marquee whitespace-nowrap">
        {[...MODELS, ...MODELS].map((m, i) => (
          <div
            key={`${m.name}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm"
            aria-hidden={i >= MODELS.length}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 text-[10px] font-bold text-violet-700">
              {m.short}
            </span>
            <span className="text-sm font-medium text-gray-700">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
