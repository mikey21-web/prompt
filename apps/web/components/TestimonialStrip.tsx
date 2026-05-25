import { Quote } from 'lucide-react';

const QUOTES = [
  {
    body: 'I stopped maintaining 4 prompt files. PromptForge translates one sentence into all 4 formats. Wild.',
    author: 'Maya R.',
    role: 'AI engineer',
    avatar: 'MR',
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    body: "Showdown ended a week of arguing about which model writes better Python. Just ran it, picked the winner, moved on.",
    author: 'Devon K.',
    role: 'Tech lead',
    avatar: 'DK',
    accent: 'from-blue-500 to-indigo-500',
  },
  {
    body: 'The Chrome extension forges right inside Claude. Hit the button, prompt gets rewritten in place. Feels illegal.',
    author: 'Priya S.',
    role: 'Product designer',
    avatar: 'PS',
    accent: 'from-emerald-500 to-teal-500',
  },
];

export function TestimonialStrip() {
  return (
    <section className="border-y border-gray-100 bg-gradient-to-b from-white to-gray-50/50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 mb-3">
            What people are saying
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Once you forge, you don&apos;t go back.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {QUOTES.map((q) => (
            <figure
              key={q.author}
              className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-violet-200 transition"
            >
              <Quote className="h-6 w-6 text-violet-200 mb-4" />
              <blockquote className="text-gray-700 leading-relaxed">
                {q.body}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${q.accent} text-xs font-bold text-white`}
                >
                  {q.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{q.author}</p>
                  <p className="text-xs text-gray-500">{q.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
