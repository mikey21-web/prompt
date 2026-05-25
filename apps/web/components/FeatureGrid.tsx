import { Hammer, Swords, Scale, Telescope, GitBranch, BookText } from 'lucide-react';

const FEATURES = [
  {
    icon: Hammer,
    name: 'Forge',
    desc: "Plain English → optimized prompt in any model's native format. One click, done.",
    accent: 'from-violet-500 to-fuchsia-500',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: Swords,
    name: 'Showdown',
    desc: 'Same input, four flagship models, side by side. Pick the winner with confidence.',
    accent: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Scale,
    name: 'Eval',
    desc: 'Run raw vs optimized against the same model. Measure if we actually helped.',
    accent: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Telescope,
    name: 'Reverse',
    desc: "Paste any prompt, get back a plain English explanation of what it does.",
    accent: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: GitBranch,
    name: 'Threads',
    desc: 'Versioned prompts. Iterate, diff, revert. Your prompt history with structure.',
    accent: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
  {
    icon: BookText,
    name: 'Style guides',
    desc: "Your personal rules baked into every forge. 'Always bullet points.' 'No passive voice.'",
    accent: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
];

export function FeatureGrid() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 mb-3">
            One engine, many tools
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Built for people who use AI seriously
          </h2>
          <p className="text-lg text-gray-500">
            Not a fancier ChatGPT wrapper. A prompt translation engine, with the surrounding tools you actually need.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.name}
              className="group relative rounded-2xl border border-gray-200 bg-white p-6 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-900/5 transition-all duration-200"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.bg} ${f.iconColor} mb-4 group-hover:scale-110 transition-transform`}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{f.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              <div
                className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
