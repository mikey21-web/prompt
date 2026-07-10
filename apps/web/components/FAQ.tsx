'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: "How is this different from just prompting ChatGPT to 'rewrite my prompt'?",
    a: 'PromptForge knows the native idiom of every flagship model. Claude wants XML tags. GPT wants markdown. Midjourney wants comma-separated tokens with --params. Sora wants shotlists. We translate one idea into all four formats automatically.',
  },
  {
    q: "Is it really free? What's the catch?",
    a: 'It is genuinely free, no credit card required. We bumped daily limits to 10,000 forges per user — effectively unlimited for any normal use case. We may add a paid tier later for power users, but everything that exists today stays free.',
  },
  {
    q: 'Where does the optimization actually happen?',
    a: 'Your prompt is sent to our backend on Convex, which calls OpenAI / Anthropic / Google APIs depending on the target. We never store your prompts unless you explicitly click Share. Threads and history are stored only when you save them.',
  },
  {
    q: 'Does the Chrome extension work on every AI site?',
    a: 'Out of the box: chatgpt.com, claude.ai, gemini.google.com. The Forge button injects directly next to the prompt input. We add new sites every couple of weeks based on what users request.',
  },
  {
    q: 'Can I use my own API key instead?',
    a: 'On the roadmap. Right now all forges run through our shared keys, which is why we keep daily limits high but not infinite. BYOK support arrives in v2.',
  },
  {
    q: 'How do I know it actually makes prompts better?',
    a: 'We run public A/B tests on every forge: same input, raw vs optimized, blind-rated by users. The live win rate is on /benchmark, updated in real time. No marketing claims, just live data.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            FAQ
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>
            Questions, answered.
          </h2>
        </motion.div>

        <div className="divide-y border-t" style={{ borderColor: 'var(--border)' }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={`flex items-center justify-between w-full text-left px-0 py-5 transition-colors duration-150 ${
                    isOpen ? '' : 'hover:text-[var(--text-primary)]'
                  }`}
                  style={{ color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold pr-8 text-base">{f.q}</span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-150"
                    style={
                      isOpen
                        ? { borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#ffffff' }
                        : { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-muted)' }
                    }
                  >
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
