"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { useState } from "react";

const MODE_LABELS: Record<string, string> = {
  compress: "⚡ Compress",
  enhance: "✨ Enhance",
  rewrite: "✏️ Rewrite",
  tone: "🎭 Tone",
  qa: "💬 Q&A",
  template: "📋 Template",
  api: "⚙️ API",
};

export default function HistoryPage() {
  const [filterMode, setFilterMode] = useState<string>("");
  const history = useQuery(api.prompts.getHistory, {
    limit: 50,
    mode: filterMode || undefined,
  });
  const deletePrompt = useMutation(api.prompts.deletePrompt);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All modes</option>
          {Object.entries(MODE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {history?.map((item) => (
          <div key={item._id} className="bg-white border rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded font-medium">
                  {MODE_LABELS[item.mode] ?? item.mode}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                {item.savedTokens > 0 && (
                  <span className="text-xs text-green-600">
                    -{item.savedTokens} tokens
                  </span>
                )}
              </div>
              <button
                onClick={() => deletePrompt({ promptId: item._id })}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Original</p>
                <p className="text-gray-600 line-clamp-3 bg-gray-50 rounded p-2 whitespace-pre-wrap">
                  {item.original}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Optimized</p>
                <p className="text-gray-800 line-clamp-3 bg-green-50 rounded p-2 whitespace-pre-wrap">
                  {item.optimized}
                </p>
              </div>
            </div>
          </div>
        ))}

        {history?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No optimizations yet. Try optimizing a prompt from the dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
