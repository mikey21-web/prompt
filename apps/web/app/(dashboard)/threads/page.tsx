'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import { GitBranch, Clock } from 'lucide-react';

export default function ThreadsPage() {
  const threads = useQuery(api.threads.listThreads, { limit: 100 });

  if (threads === undefined) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Threads</h1>
        <p className="mt-2 text-gray-600">
          Versioned prompts. Iterate, diff, revert.
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <GitBranch className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-3 text-sm text-gray-600">
            No threads yet. Forge a prompt and click &ldquo;Save as thread&rdquo; to start one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Link
              key={t._id}
              href={`/threads/${t._id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-violet-300 hover:shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 truncate">{t.title}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">
                    {t.target}
                  </span>{' '}
                  · {t.modality}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                <Clock className="h-3.5 w-3.5" />
                {new Date(t.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
