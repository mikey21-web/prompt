'use client';

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, Chrome, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { HeroDemo } from '@/components/HeroDemo';
import { ModelMarquee } from '@/components/ModelMarquee';
import { FeatureGrid } from '@/components/FeatureGrid';
import { TestimonialStrip } from '@/components/TestimonialStrip';
import { LandingTrustStrip } from '@/components/LandingTrustStrip';
import { FAQ } from '@/components/FAQ';
import { SiteFooter } from '@/components/SiteFooter';

// Emil: stagger 50ms between items, ease-out-expo
const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-[100dvh] bg-[oklch(99%_0.003_270)] text-[oklch(12%_0.008_270)]">

      {/* ── Sticky nav ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-[oklch(90%_0.005_270)] bg-[oklch(99%_0.003_270)]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[oklch(45%_0.006_270)]">
            <Link href="/showcase" className="hover:text-[oklch(12%_0.008_270)] transition-colors duration-150">Showcase</Link>
            <Link href="/benchmark" className="hover:text-[oklch(12%_0.008_270)] transition-colors duration-150">Benchmark</Link>
            <Link href="/install" className="hover:text-[oklch(12%_0.008_270)] transition-colors duration-150">Install</Link>
            <Link href="/pricing" className="hover:text-[oklch(12%_0.008_270)] transition-colors duration-150">Pricing</Link>
          </div>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-[oklch(45%_0.006_270)] hover:text-[oklch(12%_0.008_270)] transition-colors hidden sm:inline px-3 py-1.5">
                  Sign in
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="btn-press inline-flex items-center gap-1.5 bg-[oklch(12%_0.008_270)] text-[oklch(99%_0.003_270)] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[oklch(20%_0.008_270)] transition-colors duration-150">
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-press inline-flex items-center gap-1.5 bg-[oklch(12%_0.008_270)] text-[oklch(99%_0.003_270)] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[oklch(20%_0.008_270)] transition-colors duration-150">
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ── Hero — left-aligned split (Taste: anti-center bias) ─────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="max-w-xl"
        >
          {/* Eyebrow */}
          <motion.div variants={stagger.item} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[oklch(52%_0.22_290)] mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(52%_0.22_290)] opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(52%_0.22_290)]" />
            </span>
            Prompt translation engine
          </motion.div>

          {/* Headline — Taste: tracking-tighter, weight contrast, no gradient text */}
          <motion.h1 variants={stagger.item} className="text-5xl md:text-6xl font-bold tracking-tighter leading-[1.02] mb-6">
            Plain English in.
            <br />
            <span className="text-[oklch(52%_0.22_290)]">Native prompts</span>
            <br />
            out.
          </motion.h1>

          {/* Body — Impeccable: max 65ch, leading-relaxed */}
          <motion.p variants={stagger.item} className="text-lg text-[oklch(45%_0.006_270)] leading-relaxed max-w-[55ch] mb-8">
            Claude wants XML. GPT wants markdown. Midjourney wants tokens.
            Sora wants shotlists. One sentence in, every model&apos;s native format out.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={stagger.item} className="flex items-center gap-3 flex-wrap mb-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-press inline-flex items-center gap-2 bg-[oklch(12%_0.008_270)] text-[oklch(99%_0.003_270)] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[oklch(20%_0.008_270)] transition-colors duration-150">
                  Start forging
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignInButton>
              <Link href="/install" className="btn-press inline-flex items-center gap-2 text-[oklch(30%_0.008_270)] px-5 py-3 rounded-xl text-sm font-medium border border-[oklch(85%_0.005_270)] hover:border-[oklch(70%_0.005_270)] hover:bg-[oklch(97%_0.003_270)] transition-all duration-150">
                <Chrome className="h-4 w-4" />
                Get the extension
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/forge" className="btn-press inline-flex items-center gap-2 bg-[oklch(12%_0.008_270)] text-[oklch(99%_0.003_270)] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[oklch(20%_0.008_270)] transition-colors duration-150">
                Open Forge
                <ArrowRight className="h-4 w-4" />
              </Link>
            </SignedIn>
          </motion.div>

          <motion.p variants={stagger.item} className="text-xs text-[oklch(60%_0.005_270)]">
            Free forever. No credit card. Works in Chrome, VS Code, Discord.
          </motion.p>

          {/* Trust strip — only shows when real data exists */}
          <motion.div variants={stagger.item}>
            <LandingTrustStrip />
          </motion.div>
        </motion.div>

        {/* Right: live demo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          <HeroDemo />
        </motion.div>
      </section>

      {/* ── Model marquee ──────────────────────────────────────────────── */}
      <div className="border-y border-[oklch(90%_0.005_270)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(60%_0.005_270)] mb-4 text-center">
            Speaks the native idiom of every flagship model
          </p>
          <ModelMarquee />
        </div>
      </div>

      {/* ── Feature grid ───────────────────────────────────────────────── */}
      <FeatureGrid />

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <TestimonialStrip />

      {/* ── Where it works ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(52%_0.22_290)] mb-4">
              One account, five surfaces
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-5">
              Wherever you write prompts
            </h2>
            <p className="text-lg text-[oklch(45%_0.006_270)] leading-relaxed max-w-[50ch]">
              Hit the same engine from anywhere. Your style guides, threads, and history sync everywhere.
            </p>
          </div>
          {/* Asymmetric grid — Taste: no 3-column equal cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Web app', sub: 'promptforge.dev', span: 'col-span-2' },
              { label: 'Chrome extension', sub: 'ChatGPT, Claude, Gemini', span: '' },
              { label: 'VS Code', sub: '+ Cursor', span: '' },
              { label: 'Desktop', sub: 'Win, Mac, Linux', span: '' },
              { label: 'Discord bot', sub: '/forge in any server', span: '' },
            ].map((s) => (
              <div
                key={s.label}
                className={`spotlight-card rounded-2xl border border-[oklch(90%_0.005_270)] bg-white p-5 hover:border-[oklch(75%_0.01_270)] transition-colors duration-200 ${s.span}`}
              >
                <p className="font-semibold text-[oklch(12%_0.008_270)] mb-0.5">{s.label}</p>
                <p className="text-xs text-[oklch(55%_0.006_270)]">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── Final CTA — left-aligned, no gradient text ─────────────────── */}
      <section className="border-t border-[oklch(90%_0.005_270)]">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-5">
              Stop maintaining four prompt files.
            </h2>
            <p className="text-lg text-[oklch(45%_0.006_270)] leading-relaxed max-w-[50ch]">
              One sentence in PromptForge becomes the right prompt for every model. Free, forever.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-press inline-flex items-center gap-2 bg-[oklch(12%_0.008_270)] text-[oklch(99%_0.003_270)] px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-[oklch(20%_0.008_270)] transition-colors duration-150 w-fit">
                  Start free
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/forge" className="btn-press inline-flex items-center gap-2 bg-[oklch(12%_0.008_270)] text-[oklch(99%_0.003_270)] px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-[oklch(20%_0.008_270)] transition-colors duration-150 w-fit">
                Open Forge
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </SignedIn>
            <p className="text-xs text-[oklch(60%_0.005_270)]">
              No credit card. No usage caps that matter.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
