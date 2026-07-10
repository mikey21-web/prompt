'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const } },
};

export default function LibraryPage() {
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');

  const templates = useQuery(api.templates.listPublic, {
    tag: tag || undefined,
    limit: 100,
  });

  if (templates === undefined) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = search
    ? templates.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.tags.some((tg) => tg.toLowerCase().includes(search.toLowerCase()))
      )
    : templates;

  // Aggregate all tags from current results for the tag pills
  const allTags = Array.from(
    new Set(templates.flatMap((t) => t.tags))
  ).sort();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-gray-900">Library</h1>
        <p className="mt-2 text-gray-600">
          Curated starter prompts. Tap one to forge it for your model of choice.
        </p>
      </motion.div>

      <motion.div variants={item} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or tag…"
            className="flex-1 border-0 p-0 text-sm focus:outline-none focus:ring-0"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTag('')}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              tag === ''
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t === tag ? '' : t)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                tag === t
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={item} className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-3 text-sm text-gray-600">
            No templates match your search.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <Link
              key={t._id}
              href={`/forge?seed=${encodeURIComponent(t.content)}&target=${encodeURIComponent(t.targetModel)}`}
              className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-violet-300 hover:shadow"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-violet-700">
                {t.title}
              </h3>
              <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                {t.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {t.tags.slice(0, 3).map((tg) => (
                  <span
                    key={tg}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700"
                  >
                    {tg}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-wide text-gray-400">
                {t.targetModel}
              </p>
            </Link>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
