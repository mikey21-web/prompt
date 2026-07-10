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
    <section className="border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-widest mb-12" style={{ color: 'var(--text-muted)' }}>
          What people are saying
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <motion.figure
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="md:col-span-2 rounded-2xl p-8 flex flex-col justify-between"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderWidth: 1 }}
          >
            <blockquote className="text-xl font-medium leading-relaxed mb-8" style={{ color: 'var(--text-primary)' }}>
              &ldquo;{QUOTES[0].body}&rdquo;
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}>
                {QUOTES[0].initials}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{QUOTES[0].author}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{QUOTES[0].role}</p>
              </div>
            </figcaption>
          </motion.figure>

          <div className="flex flex-col gap-5">
            {QUOTES.slice(1).map((q, i) => (
              <motion.figure
                key={q.author}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i + 1) * 0.07, ease: [0.23, 1, 0.32, 1] }}
                className="flex-1 rounded-2xl p-6 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderWidth: 1 }}
              >
                <blockquote className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-primary)' }}>
                  &ldquo;{q.body}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    {q.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{q.author}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{q.role}</p>
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
