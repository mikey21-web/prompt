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
});
