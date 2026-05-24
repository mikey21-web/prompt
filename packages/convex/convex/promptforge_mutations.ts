import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Internal mutations consumed by promptforge actions. These live in their
 * own file because actions in promptforge.ts run on the Node runtime
 * (Anthropic SDK requirement) and Convex doesn't allow node-runtime files
 * to also export query/mutation handlers.
 */

export const savePromptForge = internalMutation({
  args: {
    clerkId: v.string(),
    input: v.string(),
    target: v.string(),
    modality: v.string(),
    intentJson: v.string(),
    optimized: v.string(),
    tokensIn: v.number(),
    tokensOut: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("forgeRuns", {
      userId: user._id,
      input: args.input,
      target: args.target,
      modality: args.modality,
      intentJson: args.intentJson,
      optimized: args.optimized,
      tokensIn: args.tokensIn,
      tokensOut: args.tokensOut,
      createdAt: Date.now(),
    });
  },
});

export const recordRating = internalMutation({
  args: {
    runId: v.id("forgeRuns"),
    clerkId: v.string(),
    rating: v.union(v.literal("up"), v.literal("down")),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("forgeRatings")
      .withIndex("by_run_user", (q) =>
        q.eq("runId", args.runId).eq("userId", user._id)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        comment: args.comment,
      });
      return existing._id;
    }
    return await ctx.db.insert("forgeRatings", {
      runId: args.runId,
      userId: user._id,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });
  },
});
