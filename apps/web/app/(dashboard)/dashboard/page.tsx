"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { TokenSavings } from "@promptforge/ui";
import { QuotaCard } from "@/components/QuotaCard";
import { RecentOptimizations } from "@/components/RecentOptimizations";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import Link from "next/link";
import { Zap, Swords, FlaskConical, GitBranch } from "lucide-react";

const QUICK_ACTIONS = [
  {
    href: "/forge",
    label: "Forge",
    description: "Plain English → optimized prompt",
    icon: Zap,
  },
  {
    href: "/showdown",
    label: "Showdown",
    description: "Compare 4 flagship models",
    icon: Swords,
  },
  {
    href: "/eval",
    label: "Eval",
    description: "Raw vs optimized, same model",
    icon: FlaskConical,
  },
  {
    href: "/threads",
    label: "Threads",
    description: "Versioned prompts with diff",
    icon: GitBranch,
  },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const } },
};

export default function DashboardPage() {
  const user = useQuery(api.users.getMe);
  const stats = useQuery(api.usageLogs.getStats, { days: 30 });

  if (user === undefined) {
    return (
      <div className="animate-pulse text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading dashboard...
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Account setup in progress... Refresh in a moment.
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-7">
      <OnboardingBanner />

      <motion.div variants={item}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Pick a tool below or jump into Forge.
        </p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-xl border p-4 transition-all hover:translate-y-[-1px]"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
            }}
          >
            <div
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg mb-3"
              style={{ backgroundColor: 'var(--accent-dim)' }}
            >
              <a.icon className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {a.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {a.description}
            </p>
          </Link>
        ))}
      </motion.div>

      <motion.div variants={item} className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-5">
          <QuotaCard />

          {stats && (
            <div className="space-y-3">
              <div
                className="rounded-xl border p-5 text-center"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
              >
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {stats.totalRequests}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Forges in the last 30 days
                </div>
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
              >
                <TokenSavings
                  tokens={stats.totalSavedTokens}
                  estimatedCost={stats.estimatedSavedCost}
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <RecentOptimizations />
        </div>
      </motion.div>
    </motion.div>
  );
}
