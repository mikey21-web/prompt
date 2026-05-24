import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team")),
    workspaceId: v.optional(v.id("workspaces")),
    dailyUsage: v.number(),
    dailyReset: v.number(),
    apiKey: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    preferences: v.optional(v.object({
      emailNotifications: v.boolean(),
    })),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_apiKey", ["apiKey"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  prompts: defineTable({
    userId: v.id("users"),
    original: v.string(),
    optimized: v.string(),
    mode: v.union(
      v.literal("compress"),
      v.literal("enhance"),
      v.literal("rewrite"),
      v.literal("tone"),
      v.literal("qa"),
      v.literal("template"),
      v.literal("api")
    ),
    targetModel: v.union(
      v.literal("gpt4o"),
      v.literal("claude"),
      v.literal("gemini"),
      v.literal("midjourney"),
      v.literal("auto")
    ),
    tokensIn: v.number(),
    tokensOut: v.number(),
    savedTokens: v.number(),
    source: v.union(
      v.literal("extension"),
      v.literal("desktop"),
      v.literal("web"),
      v.literal("api")
    ),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  templates: defineTable({
    authorId: v.id("users"),
    workspaceId: v.optional(v.id("workspaces")),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    targetModel: v.string(),
    isPublic: v.boolean(),
    votes: v.number(),
    usageCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_isPublic", ["isPublic"])
    .index("by_authorId", ["authorId"])
    .index("by_workspaceId", ["workspaceId"]),

  templateVotes: defineTable({
    templateId: v.id("templates"),
    userId: v.id("users"),
  }).index("by_template_user", ["templateId", "userId"]),

  workspaces: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    seats: v.number(),
    createdAt: v.number(),
  }),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"]),

  usageLogs: defineTable({
    userId: v.id("users"),
    mode: v.string(),
    tokensIn: v.number(),
    tokensOut: v.number(),
    savedTokens: v.number(),
    source: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  // ----- PromptForge engine tables -----

  forgeRuns: defineTable({
    userId: v.id("users"),
    input: v.string(),
    target: v.string(),
    modality: v.string(),
    intentJson: v.string(),
    optimized: v.string(),
    tokensIn: v.number(),
    tokensOut: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_target", ["target"]),

  forgeRatings: defineTable({
    runId: v.id("forgeRuns"),
    userId: v.id("users"),
    rating: v.union(v.literal("up"), v.literal("down")),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_run_user", ["runId", "userId"])
    .index("by_run", ["runId"]),

  forgeShares: defineTable({
    /** Public shortcode used in /s/{slug} URLs. */
    slug: v.string(),
    /** Owning user (null for anonymous public shares). */
    userId: v.optional(v.id("users")),
    input: v.string(),
    intentJson: v.string(),
    /** JSON-encoded array of {target, optimized} objects. */
    outputsJson: v.string(),
    createdAt: v.number(),
    /** View counter for popularity sorting. */
    views: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_user", ["userId"]),

  abVotes: defineTable({
    userId: v.id("users"),
    rawInput: v.string(),
    optimized: v.string(),
    target: v.string(),
    winner: v.union(v.literal("raw"), v.literal("optimized"), v.literal("tie")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_target", ["target"]),

  /**
   * Versioned forge runs. Each forge or showdown is a "thread"; users can
   * iterate, save edits, and revert. A thread keeps its head pointer in
   * `currentVersionId`; versions form an append-only chain.
   */
  promptThreads: defineTable({
    userId: v.id("users"),
    title: v.string(),
    target: v.string(),
    modality: v.string(),
    currentVersionId: v.optional(v.id("promptVersions")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_updated", ["userId", "updatedAt"]),

  promptVersions: defineTable({
    threadId: v.id("promptThreads"),
    /** Version 1 is the initial forge output; subsequent versions are user edits. */
    versionNum: v.number(),
    /** Source of the edit: "forge" (initial), "edit" (user typed), "ai" (re-forge). */
    source: v.union(
      v.literal("forge"),
      v.literal("edit"),
      v.literal("ai")
    ),
    content: v.string(),
    /** Optional commit message: what changed and why. */
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_version", ["threadId", "versionNum"]),

  /**
   * Custom per-user style guides. Override or extend the built-in system
   * style guides for any target model. The `rules` and `avoid` arrays are
   * appended to the built-in guide during synthesis.
   */
  customStyleGuides: defineTable({
    userId: v.id("users"),
    /** Target model this guide applies to. */
    targetModel: v.string(),
    /** Human-readable name for this guide. */
    name: v.string(),
    /** Additional rules to append to the built-in guide. */
    rules: v.array(v.string()),
    /** Additional anti-patterns to append to the built-in guide. */
    avoid: v.array(v.string()),
    /** Optional format override — replaces the built-in format skeleton. */
    formatOverride: v.optional(v.string()),
    /** Whether this guide is active (only one per target can be active). */
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_target", ["userId", "targetModel"]),
});
