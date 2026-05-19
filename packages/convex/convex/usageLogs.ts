import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
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
    const logs = await ctx.db
      .query("usageLogs")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", user._id).gte("createdAt", since)
      )
      .collect();

    const totalSavedTokens = logs.reduce((sum, l) => sum + l.savedTokens, 0);
    const byMode = logs.reduce(
      (acc, l) => ({ ...acc, [l.mode]: (acc[l.mode] ?? 0) + 1 }),
      {} as Record<string, number>
    );
    const bySource = logs.reduce(
      (acc, l) => ({ ...acc, [l.source]: (acc[l.source] ?? 0) + 1 }),
      {} as Record<string, number>
    );

    return {
      totalRequests: logs.length,
      totalSavedTokens,
      estimatedSavedCost: (totalSavedTokens / 1000) * 0.002,
      byMode,
      bySource,
    };
  },
});
