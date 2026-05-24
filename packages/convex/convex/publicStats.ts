import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Public, unauthenticated stats — power the marketing site benchmark page
 * and homepage trust signals. Aggregates only; no PII leaks.
 */

export const getGlobalBenchmark = query({
  args: {},
  handler: async (ctx) => {
    // All-time A/B votes across all users
    const votes = await ctx.db.query("abVotes").collect();

    const total = votes.length;
    const optimizedWins = votes.filter((v) => v.winner === "optimized").length;
    const rawWins = votes.filter((v) => v.winner === "raw").length;
    const ties = votes.filter((v) => v.winner === "tie").length;

    const winRate = total > 0 ? Math.round((optimizedWins / total) * 100) : null;

    // Per-target breakdown
    const byTarget: Record<
      string,
      { optimized: number; raw: number; tie: number; total: number; winRate: number }
    > = {};
    for (const v of votes) {
      if (!byTarget[v.target]) {
        byTarget[v.target] = { optimized: 0, raw: 0, tie: 0, total: 0, winRate: 0 };
      }
      byTarget[v.target][v.winner]++;
      byTarget[v.target].total++;
    }
    for (const t of Object.keys(byTarget)) {
      const b = byTarget[t];
      b.winRate = b.total > 0 ? Math.round((b.optimized / b.total) * 100) : 0;
    }

    return {
      total,
      optimizedWins,
      rawWins,
      ties,
      winRate,
      byTarget,
    };
  },
});

export const getGlobalActivity = query({
  args: {},
  handler: async (ctx) => {
    // Total forge runs (all time, all users)
    const runs = await ctx.db.query("forgeRuns").take(50000);
    const totalRuns = runs.length;

    // Distinct user count
    const uniqueUserIds = new Set(runs.map((r) => r.userId));
    const totalUsers = uniqueUserIds.size;

    // Total ratings
    const ratings = await ctx.db.query("forgeRatings").take(50000);
    const ups = ratings.filter((r) => r.rating === "up").length;
    const downs = ratings.filter((r) => r.rating === "down").length;
    const thumbsUpRate =
      ups + downs > 0 ? Math.round((ups / (ups + downs)) * 100) : null;

    // Total tokens optimized
    const totalTokensIn = runs.reduce((s, r) => s + r.tokensIn, 0);
    const totalTokensOut = runs.reduce((s, r) => s + r.tokensOut, 0);

    return {
      totalRuns,
      totalUsers,
      totalRatings: ups + downs,
      thumbsUpRate,
      totalTokensIn,
      totalTokensOut,
    };
  },
});

/**
 * Recent public shares for the showcase gallery — only items the user
 * explicitly created via the Share button.
 */
export const getPublicShowcase = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 12 }) => {
    const shares = await ctx.db
      .query("forgeShares")
      .order("desc")
      .take(limit);

    return shares.map((s) => ({
      slug: s.slug,
      input: s.input,
      intentJson: s.intentJson,
      outputsJson: s.outputsJson,
      views: s.views,
      createdAt: s.createdAt,
    }));
  },
});
