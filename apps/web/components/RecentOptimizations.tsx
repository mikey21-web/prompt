'use client';

import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function RecentOptimizations() {
  const prompts = useQuery(api.prompts.getHistory, { limit: 5 });

  if (prompts === undefined) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm animate-pulse">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="h-6 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">No optimizations yet</h2>
        <p className="text-gray-600">Start optimizing prompts to see your history here.</p>
        <Link
          href="/dashboard/optimize"
          className="mt-4 inline-block rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          Create your first optimization
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Optimizations</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {prompts.map((prompt) => (
          <div key={prompt._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {prompt.original.substring(0, 60)}
                  {prompt.original.length > 60 ? '...' : ''}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-blue-700 font-medium">
                    {prompt.mode}
                  </span>
                  <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                    {prompt.targetModel}
                  </span>
                  <span className="inline-block text-gray-500">
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-green-600">
                    -{prompt.savedTokens}
                  </span>
                  <span className="text-xs text-gray-500">tokens saved</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 px-6 py-4 text-center">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
        >
          View all optimizations
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
