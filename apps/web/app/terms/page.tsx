'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b">
        <Logo />
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">← Home</Link>
      </nav>
      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: May 25, 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acceptable use</h2>
            <p>
              PromptForge is a prompt translation tool. Use it to make your prompts better. Don&apos;t use
              it to generate content that&apos;s illegal, harmful, hateful, or violates the upstream LLM
              provider&apos;s terms (OpenAI, Anthropic, Google, etc).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No warranty</h2>
            <p>
              The service is provided &ldquo;as is&rdquo;. We make best effort to keep it up and accurate, but
              we don&apos;t guarantee uptime, output quality, or fitness for any specific purpose.
              You&apos;re responsible for reviewing forged prompts before using them in critical contexts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Free tier</h2>
            <p>
              All features are currently free. We reserve the right to introduce paid plans in the
              future, but we&apos;ll give you at least 30 days&apos; notice before changing anything that affects
              existing accounts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Account termination</h2>
            <p>
              We may suspend or terminate accounts that abuse the service (spam, scraping, ToS violations).
              You can delete your own account at any time.
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
