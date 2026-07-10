'use client';

import { motion } from 'framer-motion';
import { Hammer, Swords, Scale, Telescope, GitBranch, BookText } from 'lucide-react';

const FEATURES = [
  {
    icon: Hammer,
    name: 'Forge',
    desc: "Plain English in. Optimized prompt out, in any model's native format. One click.",
    tag: 'Core',
  },
  {
    icon: Swords,
    name: 'Showdown',
    desc: 'Same input, four flagship models, side by side. Pick the winner with data.',
    tag: 'Compare',
  },
  {
    icon: Scale,
    name: 'Eval',
    desc: 'Run raw vs optimized against the same model. Measure if we actually helped.',
    tag: 'Measure',
  },
  {
    icon: Telescope,
    name: 'Reverse',
    desc: "Paste any prompt, get back a plain English explanation of what it does.",
    tag: 'Understand',
  },
  {
    icon: GitBranch,
    name: 'Threads',
    desc: 'Versioned prompts. Iterate, diff, revert. Your prompt history with structure.',
    tag: 'History',
  },
  {
    icon: BookText,
    name: 'Style guides',
    desc: "Your personal rules baked into every forge. 'Always bullet points.' 'No passive voice.'",
    tag: 'Personalize',
  },
];

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
};

export function FeatureGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            One engine, many tools
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-5" style={{ color: 'var(--text-primary)' }}>
            Built for people who use AI seriously.
          </h2>
          <p className="text-lg leading-relaxed max-w-[45ch]" style={{ color: 'var(--text-secondary)' }}>
            Not a fancier ChatGPT wrapper. A prompt translation engine, with the surrounding tools you actually need.
          </p>
        </div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="divide-y" style={{ borderColor: 'var(--border)' }}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.name}
              variants={item}
              className="group flex items-start gap-5 py-6 first:pt-0 last:pb-0"
            >
              <div
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-secondary)',
                }}
              >
                <f.icon className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{f.name}</h3>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5"
                    style={{
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
