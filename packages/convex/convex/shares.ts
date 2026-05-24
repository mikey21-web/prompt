import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a short URL-safe slug. Conflicts are extremely unlikely at our
 * scale; we still retry once if collision is detected.
 */
function makeSlug(): string {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}

/**
 * Create a publicly shareable URL for a showdown result. Anyone with the
 * link can view; the share is anonymous unless the caller is authed.
 */
export const createShare = mutation({
  args: {
    input: v.string(),
    intentJson: v.string(),
    outputsJson: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    let userId = undefined;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
      if (user) userId = user._id;
    }

    let slug = makeSlug();
    const existing = await ctx.db
      .query("forgeShares")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) slug = makeSlug() + "x"; // collision — append char to differ

    const id = await ctx.db.insert("forgeShares", {
      slug,
      userId,
      input: args.input,
      intentJson: args.intentJson,
      outputsJson: args.outputsJson,
      createdAt: Date.now(),
      views: 0,
    });
    return { id, slug };
  },
});

/**
 * Public lookup by slug. Increments view counter on each fetch.
 */
export const getShare = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("forgeShares")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!share) return null;
    return {
      slug: share.slug,
      input: share.input,
      intentJson: share.intentJson,
      outputsJson: share.outputsJson,
      createdAt: share.createdAt,
      views: share.views,
    };
  },
});

/**
 * Increment view counter. Called from a server-side route handler so the
 * counter isn't trivially gameable.
 */
export const incrementViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("forgeShares")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!share) return;
    await ctx.db.patch(share._id, { views: share.views + 1 });
  },
});

/**
 * List a user's own forge runs (for History view).
 */
export const myRuns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const runs = await ctx.db
      .query("forgeRuns")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit ?? 50);
    return runs;
  },
});
