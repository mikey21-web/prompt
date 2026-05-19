import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getHistory = query({
  args: {
    limit: v.optional(v.number()),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 50, mode }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const results = await ctx.db
      .query("prompts")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(200);

    const filtered = mode ? results.filter((p) => p.mode === mode) : results;

    return filtered.slice(0, limit);
  },
});

export const deletePrompt = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, { promptId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const prompt = await ctx.db.get(promptId);
    if (!prompt) throw new Error("Prompt not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || prompt.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(promptId);
  },
});
