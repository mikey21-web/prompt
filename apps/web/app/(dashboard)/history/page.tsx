"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@promptforge/convex/convex/_generated/api";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const } },
};

export default function HistoryPage() {
  const { user } = useUser();
  const history = useQuery(api.prompts.getHistory, user ? { limit: 50 } : "skip");

  if (history === undefined) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        {history?.map((entry) => (
          <div key={entry._id} className="rounded-lg border bg-white p-4 shadow-sm">
            <span className="text-xs text-gray-500">
              {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <p className="mt-2 line-clamp-2 text-sm text-gray-700">{entry.original}</p>
          </div>
        ))}

        {history?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No prompts yet. Start by optimizing one!
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
