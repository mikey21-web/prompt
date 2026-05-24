import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Observability queries — power the /observability dashboard.
 * All queries are scoped to the authenticated user.
 */

export const getForgeRunStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 30 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    const runs = await ctx.db
      .query("forgeRuns")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", user._id).gte("createdAt", since)
      )
      .order("desc")
      .collect();

    // Aggregate by target model
    const byTarget: Record<string, number> = {};
    for (const r of runs) {
      byTarget[r.target] = (byTarget[r.target] ?? 0) + 1;
    }

    // Aggregate by modality
    const byModality: Record<string, number> = {};
    for (const r of runs) {
      byModality[r.modality] = (byModality[r.modality] ?? 0) + 1;
    }

    // Daily run counts (last N days)
    const dailyCounts: Record<string, number> = {};
    for (const r of runs) {
      const day = new Date(r.createdAt).toISOString().slice(0, 10);
      dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
    }

    // Token stats
    const totalTokensIn = runs.reduce((s, r) => s + r.tokensIn, 0);
    const totalTokensOut = runs.reduce((s, r) => s + r.tokensOut, 0);
    const avgTokensIn =
      runs.length > 0 ? Math.round(totalTokensIn / runs.length) : 0;
    const avgTokensOut =
      runs.length > 0 ? Math.round(totalTokensOut / runs.length) : 0;

    return {
      totalRuns: runs.length,
      byTarget,
      byModality,
      dailyCounts,
      totalTokensIn,
      totalTokensOut,
      avgTokensIn,
      avgTokensOut,
    };
  },
});

export const getRecentRuns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("forgeRuns")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});

export const getRatingStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 30 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get all forge runs in window to find their IDs
    const runs = await ctx.db
      .query("forgeRuns")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", user._id).gte("createdAt", since)
      )
      .collect();

    const runIds = new Set(runs.map((r) => r._id));

    // Get all ratings for those runs
    let ups = 0;
    let downs = 0;
    for (const run of runs) {
      const ratings = await ctx.db
        .query("forgeRatings")
        .withIndex("by_run", (q) => q.eq("runId", run._id))
        .collect();
      for (const r of ratings) {
        if (r.rating === "up") ups++;
        else downs++;
      }
    }

    const total = ups + downs;
    const thumbsUpRate = total > 0 ? Math.round((ups / total) * 100) : null;

    return { ups, downs, total, thumbsUpRate };
  },
});

export const getAbVoteStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 30 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    const votes = await ctx.db
      .query("abVotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("createdAt"), since))
      .collect();

    const byWinner: Record<string, number> = { raw: 0, optimized: 0, tie: 0 };
    const byTarget: Record<string, { optimized: number; raw: number; tie: number }> = {};

    for (const v of votes) {
      byWinner[v.winner] = (byWinner[v.winner] ?? 0) + 1;
      if (!byTarget[v.target]) byTarget[v.target] = { optimized: 0, raw: 0, tie: 0 };
      byTarget[v.target][v.winner]++;
    }

    const total = votes.length;
    const winRate =
      total > 0
        ? Math.round((byWinner.optimized / total) * 100)
        : null;

    return { total, byWinner, byTarget, winRate };
  },
});
