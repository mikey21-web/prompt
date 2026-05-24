import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { LandingTrustStrip } from "@/components/LandingTrustStrip";

const SAMPLE_INPUT =
  "a guy walks into a dark hallway, sees a black cat, runs away — cinematic horror, 8 seconds";

const SAMPLE_OUTPUTS = [
  {
    model: "Claude Sonnet 4.5",
    badge: "claude-xml",
    body: `<role>Cinematic prompt engineer.</role>
<task>Compose a horror scene script.</task>
<constraints>
  <constraint>3 shots, ~8 seconds total</constraint>
  <constraint>Volumetric blue lighting</constraint>
  <constraint>Practical sources, 35mm film grain</constraint>
</constraints>`,
  },
  {
    model: "GPT-4o",
    badge: "openai-markdown",
    body: `# Role
Cinematic prompt engineer.

# Task
Compose an 8-second horror scene: man enters dark hallway, sees a black cat, flees.

# Constraints
- 3 shots, total ~8s
- Cold blue volumetric lighting
- 35mm film grain
- End on the man fleeing`,
  },
  {
    model: "Midjourney v7",
    badge: "midjourney-tokens",
    body: `terrified man fleeing dark hallway, black cat with glowing yellow eyes, low angle shot, volumetric blue light, dust motes, 35mm film grain, cinematic horror, dolly zoom --ar 21:9 --style raw --v 7 --stylize 400`,
  },
  {
    model: "Sora 2",
    badge: "video-shotlist",
    body: `[OPENING SHOT — 3s]
Camera: Wide, slow dolly in.
Subject: Dim hallway, dust in cold blue light.
Action: Man, mid-30s, hesitates as he enters.

[CUT TO — 2s]
Camera: Low angle, locked off.
Subject: A motionless black cat, glowing yellow eyes.

[CUT TO — 3s]
Camera: Handheld, retreating.
Action: Man flees back the way he came.
[Foley: heartbeat, rising strings]`,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-bold text-xl">⚡ PromptForge</span>
        <div className="flex items-center gap-5 text-sm">
          <Link
            href="/showcase"
            className="text-gray-600 hover:text-gray-900 hidden sm:inline"
          >
            Showcase
          </Link>
          <Link
            href="/benchmark"
            className="text-gray-600 hover:text-gray-900 hidden sm:inline"
          >
            Benchmark
          </Link>
          <Link
            href="/pricing"
            className="text-gray-600 hover:text-gray-900"
          >
            Pricing
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">
                Try free
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

      {/* Hero */}
      <section className="max-w-5xl mx-auto text-center px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-medium mb-8">
          ⚡ One prompt. Every model&apos;s native format.
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-[1.05] tracking-tight">
          Plain English in.
          <br />
          <span className="text-violet-600">
            Optimized prompts out.
          </span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Claude wants XML. GPT wants markdown. Midjourney wants tokens.
          Sora wants shots. We translate one idea into all of them.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-violet-600 text-white px-6 py-3.5 rounded-xl text-base font-semibold hover:bg-violet-700 shadow-lg shadow-violet-600/20">
                Start forging — free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/forge"
              className="bg-violet-600 text-white px-6 py-3.5 rounded-xl text-base font-semibold hover:bg-violet-700 shadow-lg shadow-violet-600/20"
            >
              Open Forge
            </Link>
          </SignedIn>
          <Link
            href="/showcase"
            className="text-gray-700 px-6 py-3.5 rounded-xl text-base font-medium hover:bg-gray-50 border border-gray-200"
          >
            See examples →
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          50 free forges per day · No credit card · Works on Chrome, VS Code, Discord
        </p>
      </section>

      {/* Trust strip */}
      <LandingTrustStrip />

      {/* Showdown demo */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            One input. Four formats. Side by side.
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            This is what Showdown does. Type once, get the optimized prompt for every flagship model.
          </p>
        </div>

        {/* Input */}
        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-5 mb-6 max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2">
            Plain English input
          </p>
          <p className="text-lg text-gray-900 font-medium">
            &ldquo;{SAMPLE_INPUT}&rdquo;
          </p>
        </div>

        {/* Outputs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_OUTPUTS.map((out) => (
            <div
              key={out.model}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{out.model}</h3>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-mono text-gray-600">
                  {out.badge}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-gray-700 bg-gray-50 rounded-lg p-3 max-h-44 overflow-auto leading-relaxed">
                {out.body}
              </pre>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex items-center bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800">
                Try this with your own prompt →
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/showdown"
              className="inline-flex items-center bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800"
            >
              Run a Showdown →
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3">
            Built for people who use AI seriously
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Not a fancier ChatGPT wrapper. A prompt translation engine.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: "⚒",
                name: "Forge",
                desc: "Plain English → optimized prompt in any model's native format.",
              },
              {
                emoji: "⚔",
                name: "Showdown",
                desc: "Same input, four flagship models, side by side. Pick the best.",
              },
              {
                emoji: "⚖",
                name: "Eval",
                desc: "Run raw vs optimized against the same model. Measure if we actually helped.",
              },
              {
                emoji: "🔬",
                name: "Reverse",
                desc: "Paste any prompt, get back a plain English explanation of what it does.",
              },
              {
                emoji: "🌿",
                name: "Threads",
                desc: "Versioned prompts. Iterate, diff, revert.",
              },
              {
                emoji: "📚",
                name: "Style guides",
                desc: "Your personal rules baked into every forge. 'Always bullet points.' 'No passive voice.'",
              },
            ].map((f) => (
              <div
                key={f.name}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-violet-300 hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {f.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3">
          Wherever you write prompts
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
          One account, five surfaces. Hit the same engine from anywhere.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Web", sub: "promptforge.dev" },
            { label: "Browser", sub: "Chrome, Firefox, Edge" },
            { label: "VS Code", sub: "+ Cursor" },
            { label: "Desktop", sub: "Win, Mac, Linux" },
            { label: "Discord", sub: "/forge bot" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 text-center"
            >
              <p className="font-semibold text-gray-900">{s.label}</p>
              <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Stop fighting with prompts.
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Tell us what you want. We&apos;ll write it in the language each AI actually speaks.
        </p>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-violet-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-violet-700 shadow-lg shadow-violet-600/20">
              Start free — 50 forges per day
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/forge"
            className="inline-flex items-center bg-violet-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-violet-700 shadow-lg shadow-violet-600/20"
          >
            Open Forge
          </Link>
        </SignedIn>
        <p className="mt-3 text-xs text-gray-400">
          No credit card. Cancel any time.
        </p>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-6 mb-2">
          <Link href="/showcase" className="hover:text-gray-700">
            Showcase
          </Link>
          <Link href="/benchmark" className="hover:text-gray-700">
            Benchmark
          </Link>
          <Link href="/pricing" className="hover:text-gray-700">
            Pricing
          </Link>
        </div>
        <p>© 2026 PromptForge.</p>
      </footer>
    </main>
  );
}
