"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { PlanBadge } from "@promptforge/ui";
import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const user = useQuery(api.users.getMe);
  const generateKey = useMutation(api.users.generateApiKey);
  const [apiKey, setApiKey] = useState<string | null>(null);

  async function handleGenerateKey() {
    try {
      const key = await generateKey();
      setApiKey(key);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate key");
    }
  }

  if (!user) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <PlanBadge plan={user.plan} />
            <p className="text-sm text-gray-500 mt-1">
              {user.plan === "free"
                ? "25 optimizations/day"
                : user.plan === "pro"
                  ? "500 optimizations/day"
                  : "500 optimizations/seat/day"}
            </p>
          </div>
          {user.plan === "free" && (
            <Link
              href="/pricing"
              className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
            >
              Upgrade to Pro →
            </Link>
          )}
        </div>
      </div>

      {user.plan !== "free" && (
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Developer API</h2>
          {apiKey ? (
            <div>
              <p className="text-sm text-green-600 mb-2">
                API key generated — save it now, it won&apos;t be shown again:
              </p>
              <code className="block bg-gray-50 border rounded-lg px-3 py-2 text-sm font-mono text-gray-800 break-all">
                {apiKey}
              </code>
            </div>
          ) : user.apiKey ? (
            <div>
              <p className="text-sm text-gray-500 mb-2">
                API key already generated. Regenerate to get a new one (invalidates old key).
              </p>
              <button
                onClick={handleGenerateKey}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900"
              >
                Regenerate API Key
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateKey}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900"
            >
              Generate API Key
            </button>
          )}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono whitespace-pre">
{`POST https://your-deployment.convex.site/v1/optimize
Authorization: Bearer pf_your_key
{
  "prompt": "your prompt here",
  "mode": "compress",
  "targetModel": "auto"
}`}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Downloads</h2>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="#"
            className="border rounded-lg p-4 hover:border-violet-300 transition-colors"
          >
            <div className="text-2xl mb-2">🌐</div>
            <h3 className="font-semibold text-sm">Browser Extension</h3>
            <p className="text-xs text-gray-500 mt-1">
              Chrome / Firefox / Edge
            </p>
          </a>
          <a
            href="#"
            className="border rounded-lg p-4 hover:border-violet-300 transition-colors"
          >
            <div className="text-2xl mb-2">🖥️</div>
            <h3 className="font-semibold text-sm">Desktop App</h3>
            <p className="text-xs text-gray-500 mt-1">
              Windows / macOS / Linux
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
