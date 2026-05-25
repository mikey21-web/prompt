'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INPUT = 'a guy walks into a dark hallway, sees a black cat, runs away — cinematic horror, 8 seconds';

const OUTPUTS = [
  {
    model: 'Claude Sonnet 4.5',
    format: 'XML',
    body: `<role>Cinematic prompt engineer.</role>
<task>Compose a horror scene script.</task>
<constraints>
  <constraint>3 shots, ~8 seconds total</constraint>
  <constraint>Volumetric blue lighting</constraint>
  <constraint>Practical sources, 35mm film grain</constraint>
</constraints>`,
  },
  {
    model: 'GPT-4o',
    format: 'Markdown',
    body: `# Role
Cinematic prompt engineer.

# Task
Compose an 8-second horror scene.

# Constraints
- 3 shots, total ~8s
- Cold blue volumetric lighting
- 35mm film grain`,
  },
  {
    model: 'Midjourney v7',
    format: 'Tokens',
    body: `terrified man fleeing dark hallway, black cat with glowing yellow eyes, low angle shot, volumetric blue light, dust motes, 35mm film grain, cinematic horror, dolly zoom --ar 21:9 --style raw --v 7 --stylize 400`,
  },
  {
    model: 'Sora 2',
    format: 'Shotlist',
    body: `[OPENING SHOT — 3s]
Camera: Wide, slow dolly in.
Subject: Dim hallway, dust in cold blue light.

[CUT TO — 2s]
Camera: Low angle, locked off.
Subject: Black cat, glowing yellow eyes.

[CUT TO — 3s]
Camera: Handheld, retreating.
Action: Man flees.`,
  },
];

export function HeroDemo() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % OUTPUTS.length), 3800);
    return () => clearInterval(id);
  }, []);

  const current = OUTPUTS[active];

  return (
    <div className="rounded-2xl border border-[oklch(88%_0.005_270)] bg-white overflow-hidden shadow-[0_20px_60px_-20px_oklch(12%_0.008_270_/_0.08)]">
      {/* Input */}
      <div className="border-b border-[oklch(90%_0.005_270)] px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[oklch(60%_0.005_270)] mb-2">
          Input
        </p>
        <p className="text-sm font-medium text-[oklch(12%_0.008_270)] leading-relaxed">
          &ldquo;{INPUT}&rdquo;
        </p>
      </div>

      {/* Model tabs */}
      <div className="flex border-b border-[oklch(90%_0.005_270)] bg-[oklch(98%_0.003_270)]">
        {OUTPUTS.map((o, i) => (
          <button
            key={o.model}
            onClick={() => setActive(i)}
            className={`relative flex-1 px-2 py-3 text-[11px] font-medium transition-colors duration-150 ${
              i === active
                ? 'text-[oklch(12%_0.008_270)]'
                : 'text-[oklch(55%_0.006_270)] hover:text-[oklch(30%_0.008_270)]'
            }`}
          >
            <span className="hidden sm:inline">{o.model}</span>
            <span className="sm:hidden">{o.format}</span>
            {i === active && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-x-2 -bottom-px h-0.5 bg-[oklch(52%_0.22_290)] rounded-full"
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Output — Emil: scale(0.98) + opacity on enter, not scale(0) */}
      <div className="bg-[oklch(13%_0.008_270)] p-5 min-h-[200px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[oklch(52%_0.22_290)]">
            {current.format}
          </span>
          <span className="text-[10px] text-[oklch(45%_0.006_270)] font-mono">
            auto-detected
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.pre
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[oklch(88%_0.005_270)]"
          >
            {current.body}
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}
