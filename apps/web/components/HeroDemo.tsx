'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const INPUT = 'a guy walks into a dark hallway, sees a black cat, runs away';

const OUTPUTS = [
  {
    model: 'Claude Sonnet 4.5',
    badge: 'XML',
    accent: 'from-orange-500 to-amber-500',
    body: `<role>Cinematic prompt engineer.</role>
<task>Compose a horror scene script.</task>
<constraints>
  <constraint>3 shots, ~8 seconds total</constraint>
  <constraint>Volumetric blue lighting</constraint>
</constraints>`,
  },
  {
    model: 'GPT-4o',
    badge: 'Markdown',
    accent: 'from-emerald-500 to-teal-500',
    body: `# Role
Cinematic prompt engineer.

# Task
Compose an 8-second horror scene: man enters dark hallway, sees a black cat, flees.

# Constraints
- 3 shots, total ~8s
- Cold blue volumetric lighting
- 35mm film grain`,
  },
  {
    model: 'Midjourney v7',
    badge: 'Tokens',
    accent: 'from-fuchsia-500 to-pink-500',
    body: `terrified man fleeing dark hallway, black cat with glowing yellow eyes, low angle shot, volumetric blue light, dust motes, 35mm film grain, cinematic horror, dolly zoom --ar 21:9 --style raw --v 7 --stylize 400`,
  },
  {
    model: 'Sora 2',
    badge: 'Shotlist',
    accent: 'from-blue-500 to-indigo-500',
    body: `[OPENING SHOT — 3s]
Camera: Wide, slow dolly in.
Subject: Dim hallway, dust in cold blue light.
Action: Man, mid-30s, hesitates as he enters.

[CUT TO — 2s]
Camera: Low angle, locked off.
Subject: A motionless black cat, glowing yellow eyes.`,
  },
];

export function HeroDemo() {
  const [activeModel, setActiveModel] = useState(0);

  // Auto-advance through model tabs every 3.5s
  useEffect(() => {
    const id = setInterval(() => {
      setActiveModel((i) => (i + 1) % OUTPUTS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const current = OUTPUTS[activeModel];

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Glow */}
      <div
        aria-hidden
        className="absolute -inset-x-12 -inset-y-8 -z-10 rounded-[40px] bg-gradient-to-tr from-violet-200/40 via-fuchsia-200/40 to-blue-200/40 blur-3xl"
      />

      <div className="rounded-3xl border border-gray-200/80 bg-white shadow-2xl shadow-violet-900/10 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-medium text-gray-500">PromptForge — Forge</p>
          <div className="w-10" />
        </div>

        {/* Input panel */}
        <div className="border-b border-gray-100 bg-gradient-to-br from-violet-50/60 to-white p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
            <Sparkles className="h-3.5 w-3.5" />
            Plain English input
          </div>
          <p className="text-base md:text-lg font-medium text-gray-900 leading-relaxed">
            &ldquo;{INPUT} — cinematic horror, 8 seconds&rdquo;
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/40">
          {OUTPUTS.map((out, i) => (
            <button
              key={out.model}
              onClick={() => setActiveModel(i)}
              className={`relative flex-1 px-3 py-3 text-xs md:text-sm font-medium transition-colors ${
                i === activeModel
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="hidden md:inline">{out.model}</span>
              <span className="md:hidden">{out.badge}</span>
              {i === activeModel && (
                <span
                  className={`absolute inset-x-2 -bottom-px h-0.5 bg-gradient-to-r ${out.accent} rounded-full`}
                />
              )}
            </button>
          ))}
        </div>

        {/* Output */}
        <div className="bg-gray-950 p-5 min-h-[240px]">
          <div className="mb-3 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${current.accent} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white`}
            >
              {current.badge}
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              auto-detected
            </span>
          </div>
          <pre
            key={activeModel}
            className="whitespace-pre-wrap font-mono text-xs md:text-[13px] leading-relaxed text-gray-100 animate-fade-in"
          >
            {current.body}
          </pre>
        </div>
      </div>
    </div>
  );
}
