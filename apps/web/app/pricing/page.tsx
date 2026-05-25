'use client';

import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b">
        <Link href="/" className="font-bold text-xl">
          ⚡ PromptForge
        </Link>
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          ← Home
        </Link>
      </nav>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-8">
          🎉 Everything is free
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.05]">
          Free.
          <br />
          <span className="text-violet-600">Forever.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          No credit card. No usage caps that matter. No paywall on any feature.
          PromptForge is free for everyone while we grow.
        </p>

        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-8 text-left mb-10">
          <h2 className="font-bold text-gray-900 mb-4 text-lg">
            What you get
          </h2>
          <ul className="space-y-2 text-gray-700">
            {[
              "10,000 forges per day (effectively unlimited)",
              "All 6 optimization modes",
              "Showdown — compare 4 flagship models side by side",
              "Eval — measure raw vs optimized",
              "Reverse — explain any prompt in plain English",
              "Versioned threads with diff and revert",
              "Custom user style guides",
              "Screenshot/URL modality detection",
              "Public showcase + benchmark",
              "Chrome, Firefox, Edge extension",
              "VS Code + Cursor extension",
              "Desktop app (Win/Mac/Linux)",
              "Discord bot",
              "Developer API access",
              "Unlimited private templates",
              "Full history",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <SignInButton mode="modal">
          <button className="bg-violet-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-violet-700 shadow-lg shadow-violet-600/20">
            Start forging — free forever
          </button>
        </SignInButton>
        <p className="mt-4 text-xs text-gray-400">
          No credit card required. No surprise charges. Ever.
        </p>
      </section>
    </main>
  );
}
