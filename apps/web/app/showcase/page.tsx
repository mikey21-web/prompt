'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import { MODELS, type ModelId, type Modality } from '@promptforge/core';
import { Eye, Sparkles } from 'lucide-react';

const MODALITY_LABELS: Record<Modality, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  code: 'Code',
};

const MODALITY_COLORS: Record<Modality, string> = {
  text: 'bg-violet-50 text-violet-700',
  image: 'bg-pink-50 text-pink-700',
  video: 'bg-blue-50 text-blue-700',
  audio: 'bg-amber-50 text-amber-700',
  code: 'bg-emerald-50 text-emerald-700',
};

interface ShowdownOutput {
  target: string;
  optimized: string;
  error: string | null;
}

export default function ShowcasePage() {
  const showcase = useQuery(api.publicStats.getPublicShowcase, { limit: 24 });

  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="font-bold text-xl">
          ⚡ PromptForge
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/benchmark" className="text-gray-600 hover:text-gray-900">
            Benchmark
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700"
          >
            Try it free
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Real prompts, real users
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          See what people are
          <br />
          <span className="text-violet-600">forging.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Public showdowns shared by the PromptForge community. Same plain English input, every AI model&apos;s native format.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        {showcase === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : showcase.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-4 text-gray-600">
              No public showdowns yet. Run a Showdown and click Share to be the first.
            </p>
            <Link
              href="/showdown"
              className="mt-6 inline-flex items-center bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700"
            >
              Try Showdown →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showcase.map((s) => {
              let intent: { modality?: Modality } = {};
              let outputs: ShowdownOutput[] = [];
              try {
                intent = JSON.parse(s.intentJson);
              } catch {}
              try {
                outputs = JSON.parse(s.outputsJson);
              } catch {}

              const modality: Modality = intent.modality ?? 'text';
              const targets = outputs
                .map((o) => o.target)
                .slice(0, 4);

              return (
                <Link
                  key={s.slug}
                  href={`/s/${s.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-violet-300 hover:shadow-md transition flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${MODALITY_COLORS[modality]}`}
                    >
                      {MODALITY_LABELS[modality]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye className="h-3 w-3" />
                      {s.views}
                    </span>
                  </div>

                  <p className="font-medium text-gray-900 line-clamp-3 group-hover:text-violet-700 mb-4 flex-1">
                    &ldquo;{s.input}&rdquo;
                  </p>

                  <div className="flex flex-wrap gap-1 pt-3 border-t border-gray-100">
                    {targets.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                      >
                        {MODELS[t as ModelId]?.label ?? t}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Make your own
        </h2>
        <p className="text-gray-600 mb-8">
          Type a prompt in plain English. Get the optimized version for every flagship model. Share the link.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center bg-violet-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-violet-700 shadow-lg"
        >
          Start forging — free →
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2026 PromptForge.</p>
      </footer>
    </main>
  );
}
