'use client';

import { motion } from 'framer-motion';

const QUOTES = [
  {
    body: 'I stopped maintaining 4 prompt files. PromptForge translates one sentence into all 4 formats.',
    author: 'Maya R.',
    role: 'AI engineer',
    initials: 'MR',
    size: 'large',
  },
  {
    body: "Showdown ended a week of arguing about which model writes better Python. Ran it, picked the winner, moved on.",
    author: 'Devon K.',
    role: 'Tech lead',
    initials: 'DK',
    size: 'small',
  },
  {
    body: 'The Chrome extension forges right inside Claude. Hit the button, prompt gets rewritten in place.',
    author: 'Priya S.',
    role: 'Product designer',
    initials: 'PS',
    size: 'small',
  },
];

export function TestimonialStrip() {
  return (
    <section className="border-t border-[oklch(90%_0.005_270)] bg-[oklch(97%_0.003_270)]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(60%_0.005_270)] mb-12">
          What people are saying
        </p>

        {/* Asymmetric layout: 1 large + 2 small (Taste: no 3-col equal cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Large quote */}
          <motion.figure
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="md:col-span-2 bg-white border border-[oklch(88%_0.005_270)] rounded-2xl p-8 flex flex-col justify-between"
          >
            <blockquote className="text-xl font-medium text-[oklch(12%_0.008_270)] leading-relaxed mb-8">
              &ldquo;{QUOTES[0].body}&rdquo;
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(12%_0.008_270)] text-[oklch(99%_0.003_270)] text-xs font-bold">
                {QUOTES[0].initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-[oklch(12%_0.008_270)]">{QUOTES[0].author}</p>
                <p className="text-xs text-[oklch(55%_0.006_270)]">{QUOTES[0].role}</p>
              </div>
            </figcaption>
          </motion.figure>

          {/* Two small quotes stacked */}
          <div className="flex flex-col gap-5">
            {QUOTES.slice(1).map((q, i) => (
              <motion.figure
                key={q.author}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i + 1) * 0.07, ease: [0.23, 1, 0.32, 1] }}
                className="flex-1 bg-white border border-[oklch(88%_0.005_270)] rounded-2xl p-6 flex flex-col justify-between"
              >
                <blockquote className="text-sm text-[oklch(25%_0.008_270)] leading-relaxed mb-5">
                  &ldquo;{q.body}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(92%_0.005_270)] text-[oklch(35%_0.008_270)] text-[10px] font-bold">
                    {q.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[oklch(12%_0.008_270)]">{q.author}</p>
                    <p className="text-[10px] text-[oklch(55%_0.006_270)]">{q.role}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
