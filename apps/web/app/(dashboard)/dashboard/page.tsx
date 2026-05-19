"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import {
  UsageBar,
  PlanBadge,
  ModeButton,
  PromptDiff,
  TokenSavings,
} from "@promptforge/ui";
import { useState } from "react";
import type { Mode, TargetModel } from "@promptforge/core";
import { ALL_MODES, PLAN_LIMITS } from "@promptforge/core";

export default function DashboardPage() {
  const user = useQuery(api.users.getMe);
  const stats = useQuery(api.usageLogs.getStats, { days: 30 });
  const optimize = useAction(api.optimize.optimizePrompt);

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<Mode>("compress");
  const [targetModel, setTargetModel] = useState<TargetModel>("auto");
  const [result, setResult] = useState<{
    optimized: string;
    tokensIn: number;
    tokensOut: number;
    savedTokens: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOptimize() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await optimize({
        prompt,
        mode,
        targetModel,
        source: "web",
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  }

  if (user === undefined) {
    return (
      <div className="animate-pulse text-gray-400">Loading dashboard...</div>
    );
  }

  if (user === null) {
    return (
      <div className="text-gray-700">
        <p>Account setup in progress... Refresh in a moment.</p>
      </div>
    );
  }

  const limit = PLAN_LIMITS[user.plan].requestsPerDay;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <PlanBadge plan={user.plan} />
      </div>

      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Today&apos;s Usage</h2>
          <span className="text-sm text-gray-500">Resets at midnight UTC</span>
        </div>
        <UsageBar used={user.dailyUsage} limit={limit} />
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Quick Optimize</h2>

        <div className="grid grid-cols-3 gap-2">
          {ALL_MODES.map((m) => (
            <ModeButton
              key={m}
              mode={m}
              onClick={() => setMode(m)}
              active={mode === m}
            />
          ))}
        </div>

        <select
          value={targetModel}
          onChange={(e) => setTargetModel(e.target.value as TargetModel)}
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          <option value="auto">Auto (general LLM)</option>
          <option value="gpt4o">GPT-4o</option>
          <option value="claude">Claude</option>
          <option value="gemini">Gemini</option>
          <option value="midjourney">Midjourney</option>
        </select>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste your prompt here..."
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleOptimize}
          disabled={loading || !prompt.trim()}
          className="w-full bg-violet-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Optimizing..." : "Optimize →"}
        </button>

        {result && (
          <PromptDiff
            original={prompt}
            optimized={result.optimized}
            tokensIn={result.tokensIn}
            tokensOut={result.tokensOut}
            savedTokens={result.savedTokens}
          />
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-violet-600">
              {stats.totalRequests}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Total optimizations (30d)
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <TokenSavings
              tokens={stats.totalSavedTokens}
              estimatedCost={stats.estimatedSavedCost}
            />
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Object.keys(stats.byMode).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Modes used</div>
          </div>
        </div>
      )}
    </div>
  );
}
