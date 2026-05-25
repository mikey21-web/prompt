'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b">
        <Logo />
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">← Home</Link>
      </nav>
      <article className="max-w-3xl mx-auto px-6 py-16 prose prose-violet">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: May 25, 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">What we collect</h2>
            <p>
              Account info from Clerk: your email and a unique user id. We never see your password.
              Forge inputs you submit are sent to LLM providers (OpenAI, Anthropic, Google) for processing.
              By default, your prompts and outputs are not stored on our servers — they are only saved when you
              explicitly click <strong>Share</strong>, save a Thread, or vote on an A/B test.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">What we don&apos;t do</h2>
            <p>
              We do not sell your data. We do not train models on your prompts. We do not share your
              inputs with anyone other than the LLM provider needed to fulfill your forge.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cookies and tracking</h2>
            <p>
              We use a single first-party session cookie from Clerk for authentication.
              Anonymous analytics are collected via Vercel Analytics, which does not use cookies and does
              not track individual users across sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your rights</h2>
            <p>
              You can delete your account and all associated data at any time from <Link href="/settings" className="text-violet-700 underline">Settings</Link>.
              Email <a href="mailto:hello@promptforge.dev" className="text-violet-700 underline">hello@promptforge.dev</a> for any data request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Contact</h2>
            <p>
              Questions? <a href="mailto:hello@promptforge.dev" className="text-violet-700 underline">hello@promptforge.dev</a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
