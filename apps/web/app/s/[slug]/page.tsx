import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@promptforge/convex/convex/_generated/api';
import { MODELS, type ModelId, type Modality } from '@promptforge/core';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface ShareData {
  slug: string;
  input: string;
  intentJson: string;
  outputsJson: string;
  views: number;
  createdAt: number;
}

async function fetchShare(slug: string): Promise<ShareData | null> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  const client = new ConvexHttpClient(url);
  return (await client.query(api.shares.getShare, { slug })) as ShareData | null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const share = await fetchShare(params.slug);
  if (!share) {
    return { title: 'PromptForge — Share not found' };
  }
  const preview = share.input.slice(0, 80);
  const title = `"${preview}" — PromptForge Showdown`;
  const description = `See how this prompt looks across multiple AI models. Same input, optimized for each.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: { slug: string };
}) {
  const share = await fetchShare(params.slug);
  if (!share) notFound();

  let intent: { modality: Modality; subject?: string };
  let outputs: { target: ModelId; optimized: string; error: string | null }[];
  try {
    intent = JSON.parse(share.intentJson);
    outputs = JSON.parse(share.outputsJson);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold text-violet-700 hover:text-violet-900"
          >
            ← PromptForge
          </Link>
          <span className="text-xs text-gray-500">
            {share.views.toLocaleString()} views
          </span>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Plain English input
          </p>
          <p className="mt-2 text-lg text-gray-900">{share.input}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {outputs.map((out) => {
            const m = MODELS[out.target];
            return (
              <div
                key={out.target}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-gray-900">
                  {m?.label ?? out.target}
                </h3>
                <p className="text-xs text-gray-500">{m?.format ?? '—'}</p>
                {out.error ? (
                  <p className="mt-3 text-xs text-red-600">{out.error}</p>
                ) : (
                  <pre className="mt-3 whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs text-gray-900 overflow-auto max-h-96">
                    {out.optimized}
                  </pre>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-lg border border-violet-200 bg-violet-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-violet-900">
            Make your own
          </h2>
          <p className="mt-1 text-sm text-violet-700">
            Type plain English. See it formatted for every major AI model in one click.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-block rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            Try PromptForge →
          </Link>
        </div>
      </div>
    </div>
  );
}
