import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_LIMITS } from "@promptforge/core";

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clerkId, email }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId,
      email,
      plan: "free",
      dailyUsage: 0,
      dailyReset: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const checkAndIncrementUsage = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    const midnight = new Date();
    midnight.setUTCHours(0, 0, 0, 0);

    if (user.dailyReset < midnight.getTime()) {
      await ctx.db.patch(user._id, { dailyUsage: 0, dailyReset: now });
      user.dailyUsage = 0;
    }

    const limit = PLAN_LIMITS[user.plan].requestsPerDay;
    if (user.dailyUsage >= limit) {
      throw new Error(
        `Daily limit reached (${limit} requests/day on ${user.plan} plan). Upgrade at /pricing.`
      );
    }

    await ctx.db.patch(user._id, { dailyUsage: user.dailyUsage + 1 });
    return user;
  },
});

export const getUserByApiKey = internalMutation({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_apiKey", (q) => q.eq("apiKey", apiKey))
      .unique();
  },
});

export const generateApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (user.plan === "free")
      throw new Error("API access requires Pro plan or higher");

    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const apiKey = `pf_${Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;

    await ctx.db.patch(user._id, { apiKey });
    return apiKey;
  },
});

export const updatePreferences = mutation({
  args: {
    emailNotifications: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    await ctx.db.patch(user._id, {
      preferences: { emailNotifications: args.emailNotifications },
    });
  },
});

export const updatePlan = mutation({
  args: {
    clerkId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team")),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, plan, stripeCustomerId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const patch: { plan: "free" | "pro" | "team"; stripeCustomerId?: string } = {
      plan,
    };
    if (stripeCustomerId) patch.stripeCustomerId = stripeCustomerId;

    await ctx.db.patch(user._id, patch);
  },
});
