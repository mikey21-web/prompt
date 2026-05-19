"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@promptforge/convex/convex/_generated/api";

export default function HistoryPage() {
  const { user } = useUser();
  const history = useQuery(api.prompts.getHistory, user ? { limit: 50 } : "skip");

  if (history === undefined) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">History</h1>

      <div className="space-y-3">
        {history?.map((item) => (
          <div key={item._id} className="rounded-lg border bg-white p-4 shadow-sm">
            <span className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <p className="mt-2 line-clamp-2 text-sm text-gray-700">{item.original}</p>
          </div>
        ))}

        {history?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No prompts yet. Start by optimizing one!
          </div>
        )}
      </div>
    </div>
  );
}
