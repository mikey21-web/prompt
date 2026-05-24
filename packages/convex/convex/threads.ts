import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Prompt threads: Git-for-prompts. Each thread is a single conversation/
 * task and contains an append-only chain of versions. Users can edit a
 * version (creates a new one), revert to an old version (also creates a
 * new one pointing at the old content), and view diffs between any two.
 */

async function loadUser(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
  db: any;
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Create a new thread starting from an initial forge output. The first
 * version is automatically created as version 1.
 */
export const createThread = mutation({
  args: {
    title: v.string(),
    target: v.string(),
    modality: v.string(),
    initialContent: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await loadUser(ctx);
    const now = Date.now();
    const threadId = await ctx.db.insert("promptThreads", {
      userId: user._id,
      title: args.title,
      target: args.target,
      modality: args.modality,
      createdAt: now,
      updatedAt: now,
    });
    const versionId = await ctx.db.insert("promptVersions", {
      threadId,
      versionNum: 1,
      source: "forge",
      content: args.initialContent,
      createdAt: now,
    });
    await ctx.db.patch(threadId, { currentVersionId: versionId });
    return { threadId, versionId };
  },
});

/**
 * Save an edit as a new version. The thread's head pointer advances.
 */
export const saveVersion = mutation({
  args: {
    threadId: v.id("promptThreads"),
    content: v.string(),
    source: v.union(v.literal("edit"), v.literal("ai")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await loadUser(ctx);
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== user._id) throw new Error("Not found");

    // Find the current max versionNum for this thread
    const latest = await ctx.db
      .query("promptVersions")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("desc")
      .first();
    const nextNum = (latest?.versionNum ?? 0) + 1;

    const now = Date.now();
    const versionId = await ctx.db.insert("promptVersions", {
      threadId: args.threadId,
      versionNum: nextNum,
      source: args.source,
      content: args.content,
      note: args.note,
      createdAt: now,
    });
    await ctx.db.patch(args.threadId, {
      currentVersionId: versionId,
      updatedAt: now,
    });
    return { versionId, versionNum: nextNum };
  },
});

/**
 * Revert to a prior version: creates a new version with the old content.
 * Append-only — we never destroy history.
 */
export const revertTo = mutation({
  args: {
    threadId: v.id("promptThreads"),
    versionNum: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await loadUser(ctx);
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== user._id) throw new Error("Not found");

    const target = await ctx.db
      .query("promptVersions")
      .withIndex("by_thread_version", (q) =>
        q.eq("threadId", args.threadId).eq("versionNum", args.versionNum)
      )
      .unique();
    if (!target) throw new Error("Version not found");

    const latest = await ctx.db
      .query("promptVersions")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("desc")
      .first();
    const nextNum = (latest?.versionNum ?? 0) + 1;

    const now = Date.now();
    const versionId = await ctx.db.insert("promptVersions", {
      threadId: args.threadId,
      versionNum: nextNum,
      source: "edit",
      content: target.content,
      note: `Reverted to v${args.versionNum}`,
      createdAt: now,
    });
    await ctx.db.patch(args.threadId, {
      currentVersionId: versionId,
      updatedAt: now,
    });
    return { versionId, versionNum: nextNum };
  },
});

/**
 * List a user's recent threads.
 */
export const listThreads = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const threads = await ctx.db
      .query("promptThreads")
      .withIndex("by_userId_updated", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit ?? 50);
    return threads;
  },
});

/**
 * Load a single thread + its full version history. Visibility is
 * private-only for now — sharing comes via /s/{slug}.
 */
export const getThread = query({
  args: { threadId: v.id("promptThreads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== user._id) return null;
    const versions = await ctx.db
      .query("promptVersions")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
    return { thread, versions };
  },
});
