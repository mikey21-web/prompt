'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

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
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-violet-50/30">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Questions, answered.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-violet-200 transition-colors"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex items-center justify-between w-full text-left px-5 py-4"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900 pr-4">{f.q}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      isOpen ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-600'
                    } transition-colors`}
                  >
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-gray-600 leading-relaxed text-sm">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
