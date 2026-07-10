'use client';

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Logo } from '@/components/Logo';
import { HeroDemo } from '@/components/HeroDemo';
import { FAQ } from '@/components/FAQ';
import { SiteFooter } from '@/components/SiteFooter';
import { LandingTrustStrip } from '@/components/LandingTrustStrip';

// ── Animation helpers ──────────────────────────────────────────────────────
const EASE = [0.23, 1, 0.32, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay },
  }),
};

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  },
};

// ── Ticker items ───────────────────────────────────────────────────────────
const TICKER_ITEMS =
  'FORGE ✓ SHOWDOWN ✓ EVAL ✓ REVERSE ✓ THREADS ✓ STYLE GUIDES ✓ CHROME EXTENSION ✓ VS CODE ✓ DISCORD BOT ✓ FREE FOREVER ✓';

// ── Features list ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    num: '01',
    name: 'Forge',
    desc: 'Plain English → optimized prompt in any model\'s native format.',
    tag: 'Core',
  },
  {
    num: '02',
    name: 'Showdown',
    desc: 'Same input, four flagship models, side by side.',
    tag: 'Compare',
  },
  {
    num: '03',
    name: 'Eval',
    desc: 'Raw vs optimized, same model. Measure if we actually helped.',
    tag: 'Measure',
  },
  {
    num: '04',
    name: 'Reverse',
    desc: 'Paste any prompt, get back plain English.',
    tag: 'Decode',
  },
  {
    num: '05',
    name: 'Threads',
    desc: 'Versioned prompts. Iterate, diff, revert.',
    tag: 'History',
  },
  {
    num: '06',
    name: 'Style guides',
    desc: 'Your rules baked into every forge.',
    tag: 'Customize',
  },
];

// ── Steps ──────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    title: 'Type plain English',
    desc: 'Describe what you want in natural language. No prompt engineering required.',
  },
  {
    num: '02',
    title: 'Pick your model',
    desc: 'Choose Claude, GPT-4o, Gemini, Midjourney, Sora, or let us auto-detect.',
  },
  {
    num: '03',
    title: 'Get the native format',
    desc: 'Receive the optimized prompt in that model\'s exact expected format.',
  },
];

// ── Surfaces ───────────────────────────────────────────────────────────────
const SURFACES = [
  { name: 'Web app', sub: 'promptforge.dev' },
  { name: 'Chrome extension', sub: 'ChatGPT, Claude, Gemini' },
  { name: 'VS Code', sub: '+ Cursor' },
  { name: 'Desktop', sub: 'Win, Mac, Linux' },
  { name: 'Discord bot', sub: '/forge in any server' },
];

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <main className="min-h-[100dvh] bg-[#0a0a0b] text-[#fafafa]">

      {/* ── A. Top ticker marquee ─────────────────────────────────────── */}
      <div className="border-b border-white/8 bg-[#0a0a0b] overflow-hidden py-2.5">
        <div
          className="flex whitespace-nowrap animate-marquee"
          style={{ width: 'max-content' }}
        >
          {[TICKER_ITEMS, TICKER_ITEMS].map((t, idx) => (
            <span
              key={idx}
              aria-hidden={idx > 0}
              className="text-[11px] font-semibold uppercase tracking-widest text-white/50 px-8"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── B. Sticky nav ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/40">
            <Link href="/showcase" className="hover:text-white transition-colors duration-150">Showcase</Link>
            <Link href="/benchmark" className="hover:text-white transition-colors duration-150">Benchmark</Link>
            <Link href="/install" className="hover:text-white transition-colors duration-150">Install</Link>
            <Link href="/pricing" className="hover:text-white transition-colors duration-150">Pricing</Link>
          </div>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="text-sm font-medium text-white/40 hover:text-white transition-colors hidden sm:inline px-3 py-1.5">
                  Sign in
                </button>
              </SignInButton>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 bg-white text-[#0a0a0b] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors duration-150"
                >
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <motion.span
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 bg-white text-[#0a0a0b] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors duration-150 cursor-pointer"
                >
                  Dashboard
                </motion.span>
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ── C. Hero section ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="max-w-xl"
        >
          {/* Eyebrow */}
          <motion.div variants={stagger.item} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40 mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#7c3aed] opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
            </span>
            Prompt engineering, solved.
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={stagger.item}
            className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-8 whitespace-pre-line"
          >
            {`THE PROMPT\nTRANSLATION\nENGINE.`}
          </motion.h1>

          {/* Subhead */}
          <motion.p variants={stagger.item} className="text-lg text-white/60 leading-relaxed max-w-[55ch] mb-10">
            Claude wants XML. GPT wants markdown. Midjourney wants tokens.
            One sentence in, every model&apos;s native format out.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={stagger.item} className="flex items-center gap-3 flex-wrap mb-6">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white text-[#0a0a0b] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors duration-150"
                >
                  Start forging
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </SignInButton>
              <Link href="/forge">
                <motion.span
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 text-white/60 px-5 py-3 rounded-xl text-sm font-medium border border-white/10 hover:border-white/20 hover:text-white/80 transition-all duration-150 cursor-pointer"
                >
                  See it work
                  <ArrowUpRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/forge">
                <motion.span
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white text-[#0a0a0b] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors duration-150 cursor-pointer"
                >
                  Open Forge
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </SignedIn>
          </motion.div>

          <motion.p variants={stagger.item} className="text-xs text-white/30">
            Free forever. No credit card. Works in Chrome, VS Code, Discord.
          </motion.p>
        </motion.div>

        {/* Right: live demo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
        >
          <HeroDemo />
        </motion.div>
      </section>

      {/* ── D. Stats bar ─────────────────────────────────────────────── */}
      <div className="border-y border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/8">
            {[
              { value: '10,000 / day', label: 'Free forges per user' },
              { value: '4 models', label: 'Side by side in Showdown' },
              { value: '5 surfaces', label: 'Web, Chrome, VS Code, Desktop, Discord' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className="px-8 py-8 text-center md:text-left"
              >
                <p className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── E. Live demo section ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
            01 — See it work
          </p>
          <div className="h-px bg-white/8 w-full" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="max-w-3xl mx-auto"
        >
          <HeroDemo />
        </motion.div>
      </section>

      {/* ── F. Features section ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
            02 — What it does
          </p>
          <div className="h-px bg-white/8 w-full" />
        </motion.div>

        <div className="divide-y divide-white/8 border-b border-white/8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`grid grid-cols-12 gap-4 items-center py-6 px-4 -mx-4 rounded-lg transition-colors duration-150 ${
                hoveredFeature === i ? 'bg-white/5' : ''
              }`}
            >
              <span className="col-span-1 text-xs font-semibold uppercase tracking-widest text-white/30">
                {f.num}
              </span>
              <span className="col-span-3 md:col-span-2 text-base font-semibold text-white">
                {f.name}
              </span>
              <span className="col-span-8 md:col-span-7 text-sm text-white/60 leading-relaxed">
                {f.desc}
              </span>
              <span className="hidden md:block col-span-2 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20 border border-white/10 rounded-full px-2.5 py-1">
                  {f.tag}
                </span>
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── G. How it works ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
            03 — Three steps
          </p>
          <div className="h-px bg-white/8 w-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className="px-0 md:px-10 py-10 first:pl-0 last:pr-0"
            >
              <p className="text-6xl font-bold tracking-tighter text-white/10 mb-6 leading-none">
                {step.num}
              </p>
              <h3 className="text-xl font-bold tracking-tight text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── H. Where it works ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
            04 — Five surfaces
          </p>
          <div className="h-px bg-white/8 w-full" />
        </motion.div>

        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/8 border-y border-white/8">
          {SURFACES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className="flex-1 px-6 py-8 group hover:bg-white/3 transition-colors duration-150"
            >
              <p className="text-base font-semibold text-white mb-1 group-hover:text-white transition-colors">
                {s.name}
              </p>
              <p className="text-xs text-white/40">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── I. LandingTrustStrip ─────────────────────────────────────── */}
      <LandingTrustStrip />

      {/* ── J. FAQ ───────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── K. Final CTA ─────────────────────────────────────────────── */}
      <section className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-8">
              Get started
            </p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-white mb-8">
              Stop fighting
              <br />
              with prompts.
            </h2>
            <p className="text-lg text-white/60 leading-relaxed max-w-[45ch] mx-auto mb-12">
              One sentence in PromptForge becomes the right prompt for every model. Free, forever.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-white text-[#0a0a0b] px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/90 transition-colors duration-150"
                  >
                    Start forging free
                    <ArrowUpRight className="h-4 w-4" />
                  </motion.button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/forge">
                  <motion.span
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-white text-[#0a0a0b] px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/90 transition-colors duration-150 cursor-pointer"
                  >
                    Open Forge
                    <ArrowUpRight className="h-4 w-4" />
                  </motion.span>
                </Link>
              </SignedIn>
            </div>
            <p className="mt-6 text-xs text-white/30">
              No credit card. No usage caps that matter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── L. SiteFooter ────────────────────────────────────────────── */}
      <SiteFooter />
    </main>
  );
}
