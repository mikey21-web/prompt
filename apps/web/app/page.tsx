import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

const COMPARISON = [
  ["Browser Extension", "Chrome + Firefox + Edge", "—"],
  ["Desktop App", "Win + Mac + Linux", "Windows only"],
  ["Optimization Modes", "6 modes", "2 modes"],
  ["Free requests/day", "25", "10"],
  ["Pro requests/day", "500 @ $9/mo", "100"],
  ["Template Library", "500+ community", "—"],
  ["Multi-model Targeting", "GPT-4o, Claude, Gemini, Midjourney", "—"],
  ["Developer API", "REST API + key", "—"],
  ["Team Workspaces", "Shared library + analytics", "—"],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-bold text-xl">⚡ PromptForge</span>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Pricing
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">
                Get Started Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          ⚡ Better than Tokavy
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Better Prompts.
          <br />
          <span className="text-violet-600">Less Tokens.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          6 optimization modes. Browser extension for Chrome, Firefox, and Edge.
          Desktop app for Windows, macOS, and Linux. One keystroke — any app.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-violet-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-violet-700">
                Get Started Free — 25 req/day
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-violet-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-violet-700"
            >
              Open Dashboard
            </Link>
          </SignedIn>
          <Link
            href="/pricing"
            className="text-gray-600 px-6 py-3 rounded-xl text-base font-medium hover:text-gray-900"
          >
            See pricing →
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Six modes, one keystroke
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["⚡", "Compress", "Remove filler, hedging, redundancy. 30–55% token reduction."],
              ["✨", "Enhance", "Add role, structure, output format. Better model output."],
              ["✏️", "Rewrite", "Clarity and precision. Removes vague language."],
              ["🎭", "Tone", "Adjust to formal, casual, technical, creative, or persuasive."],
              ["💬", "Q&A", "Answer 3 smart questions → perfect prompt."],
              ["📋", "Template", "500+ community templates. Vote, fork, share."],
            ].map(([emoji, name, desc]) => (
              <div
                key={name}
                className="bg-white border rounded-2xl p-6 hover:border-violet-300 transition-colors"
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{name}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          PromptForge vs Tokavy
        </h2>
        <div className="border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">
                  Feature
                </th>
                <th className="text-center px-6 py-3 font-semibold text-violet-700">
                  PromptForge
                </th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500">
                  Tokavy
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {COMPARISON.map(([feature, us, them]) => (
                <tr key={feature} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">{feature}</td>
                  <td className="px-6 py-3 text-center text-green-700 font-medium">
                    ✓ {us}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-400">{them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-400">
        <p>© 2026 PromptForge. AI prompt optimization platform.</p>
      </footer>
    </main>
  );
}
