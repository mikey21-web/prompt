"use client";

import { useQuery } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import Link from "next/link";

export default function ApiDocsPage() {
  const user = useQuery(api.users.getMe);

  if (!user) return <div className="animate-pulse">Loading...</div>;

  if (user.plan === "free") {
    return (
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Developer API</h1>
        <div className="bg-white border rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">⚙️</div>
          <h2 className="font-bold text-lg text-gray-900 mb-2">
            API access requires Pro plan
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Get programmatic access to all 6 optimization modes. 500
            requests/day on Pro.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-violet-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700"
          >
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Developer API</h1>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Quick start</h2>
        <p className="text-sm text-gray-600 mb-3">
          1. Generate an API key from{" "}
          <Link
            href="/dashboard/settings"
            className="text-violet-600 hover:underline"
          >
            Settings
          </Link>
        </p>
        <p className="text-sm text-gray-600 mb-4">
          2. Make a POST request to the optimize endpoint
        </p>

        <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">
          cURL
        </h3>
        <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto mb-4">
{`curl -X POST https://your-deployment.convex.site/v1/optimize \\
  -H "Authorization: Bearer pf_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "write me an email about a new product launch",
    "mode": "enhance",
    "targetModel": "claude"
  }'`}
        </pre>

        <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">
          Response
        </h3>
        <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-x-auto">
{`{
  "optimized": "<role>You are a product marketing copywriter...</role>...",
  "tokensIn": 12,
  "tokensOut": 87,
  "savedTokens": 0
}`}
        </pre>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Parameters</h2>
        <div className="space-y-3 text-sm">
          <div>
            <code className="text-violet-600 font-mono">prompt</code>{" "}
            <span className="text-xs text-gray-400">(required, string)</span>
            <p className="text-gray-600">The prompt to optimize.</p>
          </div>
          <div>
            <code className="text-violet-600 font-mono">mode</code>{" "}
            <span className="text-xs text-gray-400">(string, default: compress)</span>
            <p className="text-gray-600">
              One of: <code>compress</code>, <code>enhance</code>,{" "}
              <code>rewrite</code>, <code>tone</code>, <code>qa</code>,{" "}
              <code>template</code>
            </p>
          </div>
          <div>
            <code className="text-violet-600 font-mono">targetModel</code>{" "}
            <span className="text-xs text-gray-400">(string, default: auto)</span>
            <p className="text-gray-600">
              One of: <code>auto</code>, <code>gpt4o</code>, <code>claude</code>,{" "}
              <code>gemini</code>, <code>midjourney</code>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Rate Limits</h2>
        <p className="text-sm text-gray-600">
          API counts against your plan&apos;s daily request limit (Pro: 500/day,
          Team: 500/seat/day). 429 returned if exceeded.
        </p>
      </div>
    </div>
  );
}
