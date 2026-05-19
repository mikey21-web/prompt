import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listPublic = query({
  args: {
    tag: v.optional(v.string()),
    targetModel: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { tag, targetModel, limit = 50 }) => {
    let templates = await ctx.db
      .query("templates")
      .withIndex("by_isPublic", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(200);

    if (tag) templates = templates.filter((t) => t.tags.includes(tag));
    if (targetModel)
      templates = templates.filter((t) => t.targetModel === targetModel);

    return templates.sort((a, b) => b.votes - a.votes).slice(0, limit);
  },
});

export const listMine = query({
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
      .query("templates")
      .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
      .order("desc")
      .collect();
  },
});

export const createTemplate = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    targetModel: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    if (!args.isPublic && user.plan === "free") {
      const existing = await ctx.db
        .query("templates")
        .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
        .collect();
      if (existing.filter((t) => !t.isPublic).length >= 5) {
        throw new Error(
          "Free plan limited to 5 private templates. Upgrade to Pro."
        );
      }
    }

    return await ctx.db.insert("templates", {
      ...args,
      authorId: user._id,
      votes: 0,
      usageCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const voteTemplate = mutation({
  args: { templateId: v.id("templates") },
  handler: async (ctx, { templateId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("templateVotes")
      .withIndex("by_template_user", (q) =>
        q.eq("templateId", templateId).eq("userId", user._id)
      )
      .unique();

    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(templateId, {
        votes: Math.max(0, template.votes - 1),
      });
      return { voted: false };
    } else {
      await ctx.db.insert("templateVotes", { templateId, userId: user._id });
      await ctx.db.patch(templateId, { votes: template.votes + 1 });
      return { voted: true };
    }
  },
});

export const incrementUsage = mutation({
  args: { templateId: v.id("templates") },
  handler: async (ctx, { templateId }) => {
    const template = await ctx.db.get(templateId);
    if (!template) return;
    await ctx.db.patch(templateId, { usageCount: template.usageCount + 1 });
  },
});
