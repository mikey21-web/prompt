'use client';

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, Chrome, Sparkles, Zap } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { HeroDemo } from '@/components/HeroDemo';
import { ModelMarquee } from '@/components/ModelMarquee';
import { FeatureGrid } from '@/components/FeatureGrid';
import { TestimonialStrip } from '@/components/TestimonialStrip';
import { LandingTrustStrip } from '@/components/LandingTrustStrip';
import { FAQ } from '@/components/FAQ';
import { SiteFooter } from '@/components/SiteFooter';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Animated background blobs */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-[-20%] left-[10%] h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-3xl animate-blob" />
        <div className="absolute top-[30%] right-[5%] h-[400px] w-[400px] rounded-full bg-fuchsia-200/30 blur-3xl animate-blob [animation-delay:6s]" />
        <div className="absolute bottom-[10%] left-[40%] h-[450px] w-[450px] rounded-full bg-blue-200/20 blur-3xl animate-blob [animation-delay:12s]" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <Link href="/showcase" className="hover:text-gray-900 transition-colors">Showcase</Link>
            <Link href="/benchmark" className="hover:text-gray-900 transition-colors">Benchmark</Link>
            <Link href="/install" className="hover:text-gray-900 transition-colors">Install</Link>
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:inline">
                  Sign in
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="group inline-flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                  Try free
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 md:pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-violet-700 mb-8 shadow-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
            </span>
            Now with Claude 4.5, GPT-4o, Gemini 2.5, Sora 2 — free forever
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-in-up [animation-delay:80ms]">
            Plain English in.
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
              Native prompts out.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 leading-relaxed mb-10 animate-fade-in-up [animation-delay:160ms]">
            Claude wants XML. GPT wants markdown. Midjourney wants tokens.
            Sora wants shotlists. PromptForge translates one idea into all of them.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-3 animate-fade-in-up [animation-delay:240ms]">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-7 py-3.5 rounded-xl text-base font-semibold shadow-lg shadow-violet-600/30 hover:shadow-xl hover:shadow-violet-600/40 hover:scale-[1.02] transition-all">
                  <Zap className="h-4 w-4" />
                  Start forging — free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/forge"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-7 py-3.5 rounded-xl text-base font-semibold shadow-lg shadow-violet-600/30 hover:shadow-xl hover:shadow-violet-600/40 hover:scale-[1.02] transition-all"
              >
                <Zap className="h-4 w-4" />
                Open Forge
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </SignedIn>
            <Link
              href="/install"
              className="group inline-flex items-center gap-2 text-gray-700 px-6 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              <Chrome className="h-4 w-4" />
              Get the extension
            </Link>
          </div>
          <p className="text-xs text-gray-400 animate-fade-in-up [animation-delay:320ms]">
            Free forever · No credit card · Works in Chrome, VS Code, Discord
          </p>

          {/* Live demo card */}
          <div className="mt-16 animate-fade-in-up [animation-delay:400ms]">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* Trust strip (real metrics, only shows when there is data) */}
      <LandingTrustStrip />

      {/* Model marquee */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Speaks the native idiom of every flagship model
          </p>
          <ModelMarquee />
        </div>
      </section>

      {/* Feature grid */}
      <FeatureGrid />

      {/* Testimonials */}
      <TestimonialStrip />

      {/* Where it works */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 mb-3">
            One account, five surfaces
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Wherever you write prompts
          </h2>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Hit the same engine from anywhere. Your style guides, threads, and history sync everywhere.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Web', sub: 'promptforge.dev' },
              { label: 'Browser', sub: 'Chrome, Firefox, Edge' },
              { label: 'VS Code', sub: '+ Cursor' },
              { label: 'Desktop', sub: 'Win, Mac, Linux' },
              { label: 'Discord', sub: '/forge bot' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 text-center hover:border-violet-200 hover:shadow-md transition"
              >
                <p className="font-semibold text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 text-violet-700 px-3 py-1 text-xs font-medium mb-8">
            <Sparkles className="h-3 w-3" />
            Stop fighting with prompts
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-5 tracking-tight">
            Tell us what you want.
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              We&apos;ll write it right.
            </span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Stop maintaining four different prompt files. One sentence in PromptForge becomes
            the perfect prompt in every model&apos;s native format.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-xl shadow-violet-600/30 hover:scale-[1.02] transition-all">
                <Zap className="h-5 w-5" />
                Start free — forever
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/forge"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-xl shadow-violet-600/30 hover:scale-[1.02] transition-all"
            >
              <Zap className="h-5 w-5" />
              Open Forge
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </SignedIn>
          <p className="mt-4 text-xs text-gray-400">
            No credit card · No usage caps that matter · Cancel any time
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
