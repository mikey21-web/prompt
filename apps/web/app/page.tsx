'use client';

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { HeroDemo } from '@/components/HeroDemo';
import { FAQ } from '@/components/FAQ';
import { SiteFooter } from '@/components/SiteFooter';
import { LandingTrustStrip } from '@/components/LandingTrustStrip';

const EASE = [0.23, 1, 0.32, 1] as const;

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

const FEATURES = [
  { num: '01', name: 'Forge', desc: 'Plain English → optimized prompt in any model\'s native format.', tag: 'Core' },
  { num: '02', name: 'Showdown', desc: 'Same input, four flagship models, side by side.', tag: 'Compare' },
  { num: '03', name: 'Eval', desc: 'Raw vs optimized, same model. Measure if we actually helped.', tag: 'Measure' },
  { num: '04', name: 'Reverse', desc: 'Paste any prompt, get back plain English.', tag: 'Decode' },
  { num: '05', name: 'Threads', desc: 'Versioned prompts. Iterate, diff, revert.', tag: 'History' },
  { num: '06', name: 'Style guides', desc: 'Your rules baked into every forge.', tag: 'Customize' },
];

const STEPS = [
  { num: '01', title: 'Type plain English', desc: 'Describe what you want in natural language. No prompt engineering required.' },
  { num: '02', title: 'Pick your model', desc: 'Choose Claude, GPT-4o, Gemini, Midjourney, or let us auto-detect.' },
  { num: '03', title: 'Get the native format', desc: 'Receive the optimized prompt in that model\'s exact expected format.' },
];

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
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            <Link href="/showcase" className="hover:text-[var(--text-primary)] transition-colors">Showcase</Link>
            <Link href="/benchmark" className="hover:text-[var(--text-primary)] transition-colors">Benchmark</Link>
            <Link href="/install" className="hover:text-[var(--text-primary)] transition-colors">Install</Link>
            <Link href="/pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="text-sm font-medium px-3 py-1.5 transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  Sign in
                </button>
              </SignInButton>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ backgroundColor: 'var(--text-primary)', color: '#fff' }}
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--text-primary)', color: '#fff' }}
                >
                  Dashboard
                </motion.span>
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div variants={stagger.container} initial="hidden" animate="show" className="max-w-xl">
          <motion.div variants={stagger.item} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: 'var(--accent)' }}>
            <Sparkles className="h-3 w-3" />
            Prompt engineering, solved.
          </motion.div>
          <motion.h1 variants={stagger.item} className="text-6xl md:text-7xl font-bold tracking-tighter leading-none mb-8 whitespace-pre-line">
            THE PROMPT<br />TRANSLATION<br />ENGINE.
          </motion.h1>
          <motion.p variants={stagger.item} className="text-lg leading-relaxed max-w-[55ch] mb-10" style={{ color: 'var(--text-secondary)' }}>
            Claude wants XML. GPT wants markdown. Midjourney wants tokens.
            One sentence in, every model&apos;s native format out.
          </motion.p>
          <motion.div variants={stagger.item} className="flex items-center gap-3 flex-wrap mb-6">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{ backgroundColor: 'var(--text-primary)', color: '#fff' }}
                >
                  Start forging
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </SignInButton>
              <Link href="/forge">
                <motion.span
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border cursor-pointer transition-all"
                  style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--text-primary)', color: '#fff' }}
                >
                  Open Forge
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </SignedIn>
          </motion.div>
          <motion.p variants={stagger.item} className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Free forever. No credit card. Works in Chrome, VS Code, Discord.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
        >
          <HeroDemo />
        </motion.div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--border)' }}>
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
                <p className="text-3xl md:text-4xl font-bold tracking-tighter mb-1" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live demo ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            01 — See it work
          </p>
          <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }} />
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

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            02 — What it does
          </p>
          <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }} />
        </motion.div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              className="grid grid-cols-12 gap-4 items-center py-6 px-4 -mx-4 rounded-lg transition-colors duration-150"
              style={{ backgroundColor: hoveredFeature === i ? 'var(--surface)' : 'transparent' }}
            >
              <span className="col-span-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {f.num}
              </span>
              <span className="col-span-3 md:col-span-2 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {f.name}
              </span>
              <span className="col-span-8 md:col-span-7 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {f.desc}
              </span>
              <span className="hidden md:block col-span-2 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                  {f.tag}
                </span>
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            03 — Three steps
          </p>
          <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--border)' }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className="px-0 md:px-10 py-10 first:pl-0 last:pr-0"
            >
              <p className="text-6xl font-bold tracking-tighter mb-6 leading-none" style={{ color: 'var(--border)' }}>
                {step.num}
              </p>
              <h3 className="text-xl font-bold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Surfaces ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            04 — Five surfaces
          </p>
          <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }} />
        </motion.div>

        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-y" style={{ borderColor: 'var(--border)' }}>
          {SURFACES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className="flex-1 px-6 py-8 group transition-colors duration-150"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <p className="text-base font-semibold mb-1 transition-colors" style={{ color: 'var(--text-primary)' }}>
                {s.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────────── */}
      <LandingTrustStrip />

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: 'var(--text-muted)' }}>
              Get started
            </p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-8" style={{ color: 'var(--text-primary)' }}>
              Stop fighting
              <br />
              with prompts.
            </h2>
            <p className="text-lg leading-relaxed max-w-[45ch] mx-auto mb-12" style={{ color: 'var(--text-secondary)' }}>
              One sentence in PromptForge becomes the right prompt for every model. Free, forever.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-colors"
                    style={{ backgroundColor: 'var(--text-primary)', color: '#fff' }}
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
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold cursor-pointer"
                    style={{ backgroundColor: 'var(--text-primary)', color: '#fff' }}
                  >
                    Open Forge
                    <ArrowUpRight className="h-4 w-4" />
                  </motion.span>
                </Link>
              </SignedIn>
            </div>
            <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
              No credit card. No usage caps that matter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <SiteFooter />
    </main>
  );
}
