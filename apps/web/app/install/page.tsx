'use client';

import Link from 'next/link';
import { Chrome, Code2, MonitorSmartphone, MessageSquare } from 'lucide-react';

export default function InstallPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b">
        <Link href="/" className="font-bold text-xl">
          ⚡ PromptForge
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
          ← Dashboard
        </Link>
      </nav>

      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Chrome className="h-3.5 w-3.5" />
            Get PromptForge everywhere
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            One account. Five surfaces.
          </h1>
          <p className="text-lg text-gray-500">
            Hit the same engine from wherever you write prompts.
          </p>
        </div>

        {/* Browser extension — primary */}
        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Chrome className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browser extension</h2>
              <p className="text-gray-500 text-sm">
                Adds a Forge button right inside ChatGPT, Claude, and Gemini.
              </p>
            </div>
          </div>

          <ol className="space-y-3 text-sm text-gray-700 mb-6">
            <li className="flex gap-3">
              <span className="font-bold text-violet-700">1.</span>
              <div>
                <a
                  href="https://github.com/mikey21-web/prompt/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-700 underline font-medium"
                >
                  Download the latest extension build
                </a>{' '}
                (or grab it from the Chrome Web Store once approved)
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-violet-700">2.</span>
              <div>
                Open <code className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs">chrome://extensions</code> in Chrome / Edge / Brave
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-violet-700">3.</span>
              <div>Toggle <strong>Developer mode</strong> on (top-right)</div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-violet-700">4.</span>
              <div>Click <strong>Load unpacked</strong> and select the unzipped folder</div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-violet-700">5.</span>
              <div>
                Click the puzzle piece icon in the toolbar, then pin PromptForge so it
                sits next to your address bar
              </div>
            </li>
          </ol>

          <div className="rounded-xl bg-white border border-gray-200 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-1">First-time setup</p>
            <p>
              Make sure you&apos;re signed in to PromptForge in the same browser — the
              extension uses your session cookie to authenticate.
            </p>
          </div>
        </div>

        {/* Other surfaces */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <Code2 className="h-6 w-6 text-violet-600 mb-2" />
            <p className="font-semibold text-gray-900 mb-1">VS Code + Cursor</p>
            <p className="text-xs text-gray-500">
              Search &ldquo;PromptForge&rdquo; in the marketplace.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <MonitorSmartphone className="h-6 w-6 text-violet-600 mb-2" />
            <p className="font-semibold text-gray-900 mb-1">Desktop app</p>
            <p className="text-xs text-gray-500">
              Native Win / Mac / Linux. Global hotkey to forge anywhere.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <MessageSquare className="h-6 w-6 text-violet-600 mb-2" />
            <p className="font-semibold text-gray-900 mb-1">Discord bot</p>
            <p className="text-xs text-gray-500">
              <code className="bg-gray-100 px-1 rounded text-[11px]">/forge</code> in any server.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-12">
          All surfaces hit the same engine. Forge once on web, sync everywhere.
        </p>
      </section>
    </main>
  );
}
