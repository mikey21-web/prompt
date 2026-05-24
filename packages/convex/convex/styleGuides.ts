import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Custom user style guides — per-user overrides/extensions of the built-in
 * model style guides. These are merged into the synthesis prompt at forge time.
 */

export const listMyGuides = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("customStyleGuides")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getActiveGuideForTarget = query({
  args: { targetModel: v.string() },
  handler: async (ctx, { targetModel }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const guides = await ctx.db
      .query("customStyleGuides")
      .withIndex("by_userId_target", (q) =>
        q.eq("userId", user._id).eq("targetModel", targetModel)
      )
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    return guides ?? null;
  },
});

export const createGuide = mutation({
  args: {
    targetModel: v.string(),
    name: v.string(),
    rules: v.array(v.string()),
    avoid: v.array(v.string()),
    formatOverride: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // If activating this guide, deactivate all others for the same target
    if (args.active) {
      const existing = await ctx.db
        .query("customStyleGuides")
        .withIndex("by_userId_target", (q) =>
          q.eq("userId", user._id).eq("targetModel", args.targetModel)
        )
        .collect();
      for (const g of existing) {
        if (g.active) await ctx.db.patch(g._id, { active: false });
      }
    }

    const now = Date.now();
    return await ctx.db.insert("customStyleGuides", {
      userId: user._id,
      targetModel: args.targetModel,
      name: args.name,
      rules: args.rules,
      avoid: args.avoid,
      formatOverride: args.formatOverride,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateGuide = mutation({
  args: {
    guideId: v.id("customStyleGuides"),
    name: v.optional(v.string()),
    rules: v.optional(v.array(v.string())),
    avoid: v.optional(v.array(v.string())),
    formatOverride: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { guideId, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const guide = await ctx.db.get(guideId);
    if (!guide || guide.userId !== user._id) throw new Error("Not found");

    // If activating, deactivate others for same target
    if (updates.active === true) {
      const siblings = await ctx.db
        .query("customStyleGuides")
        .withIndex("by_userId_target", (q) =>
          q.eq("userId", user._id).eq("targetModel", guide.targetModel)
        )
        .collect();
      for (const g of siblings) {
        if (g._id !== guideId && g.active) {
          await ctx.db.patch(g._id, { active: false });
        }
      }
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.rules !== undefined) patch.rules = updates.rules;
    if (updates.avoid !== undefined) patch.avoid = updates.avoid;
    if (updates.formatOverride !== undefined)
      patch.formatOverride = updates.formatOverride;
    if (updates.active !== undefined) patch.active = updates.active;

    await ctx.db.patch(guideId, patch);
  },
});

export const deleteGuide = mutation({
  args: { guideId: v.id("customStyleGuides") },
  handler: async (ctx, { guideId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const guide = await ctx.db.get(guideId);
    if (!guide || guide.userId !== user._id) throw new Error("Not found");

    await ctx.db.delete(guideId);
  },
});

/**
 * Internal version used by the promptforge action (node runtime) to look up
 * the active custom guide for a given user + target combination.
 */
export const getActiveGuideForTargetInternal = internalQuery({
  args: { clerkId: v.string(), targetModel: v.string() },
  handler: async (ctx, { clerkId, targetModel }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (!user) return null;

    const guide = await ctx.db
      .query("customStyleGuides")
      .withIndex("by_userId_target", (q) =>
        q.eq("userId", user._id).eq("targetModel", targetModel)
      )
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!guide) return null;
    return {
      rules: guide.rules,
      avoid: guide.avoid,
      formatOverride: guide.formatOverride,
    };
  },
});
