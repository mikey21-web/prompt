# PromptForge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build PromptForge — a full-stack AI prompt optimization platform with browser extension (Chrome/Firefox/Edge), desktop app (Windows/macOS/Linux), and web dashboard, beating Tokavy on every dimension.

**Architecture:** Turborepo monorepo with 3 apps (web/extension/desktop) and 3 shared packages (ui/convex/core). Convex handles all backend logic including AI calls, realtime usage sync, and auth. Clerk provides authentication across all surfaces.

**Tech Stack:** Turborepo · Next.js 14 App Router · Plasmo · Tauri v2 · Convex · Clerk · OpenAI SDK · Stripe · Razorpay · Tailwind CSS · shadcn/ui · Vitest · Playwright

---

## Phase 1: Monorepo + Convex Backend

---

### Task 1: Turborepo Monorepo Scaffold

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `packages/core/package.json`
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/prompts.ts`
- Create: `packages/core/tsconfig.json`

- [ ] **Step 1: Scaffold monorepo**

```bash
cd "c:\Users\TUMMA\OneDrive\Desktop\tokavy competetior"
npx create-turbo@latest . --package-manager npm
```

When prompted: choose `npm`, select empty workspace.

- [ ] **Step 2: Replace root package.json**

```json
{
  "name": "promptforge",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.4.0"
  },
  "packageManager": "npm@10.0.0"
}
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

- [ ] **Step 4: Create packages/core directory and package.json**

```json
{
  "name": "@promptforge/core",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.6.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 5: Create packages/core/src/types.ts**

```typescript
export type Mode =
  | "compress"
  | "enhance"
  | "rewrite"
  | "tone"
  | "qa"
  | "template";

export type TargetModel =
  | "gpt4o"
  | "claude"
  | "gemini"
  | "midjourney"
  | "auto";

export type Tone =
  | "formal"
  | "casual"
  | "technical"
  | "creative"
  | "persuasive";

export type Plan = "free" | "pro" | "team";

export type Source = "extension" | "desktop" | "web" | "api";

export interface OptimizeRequest {
  prompt: string;
  mode: Mode;
  targetModel: TargetModel;
  tone?: Tone;
  templateId?: string;
}

export interface OptimizeResult {
  optimized: string;
  tokensIn: number;
  tokensOut: number;
  savedTokens: number;
}

export const PLAN_LIMITS: Record<Plan, { requestsPerDay: number }> = {
  free: { requestsPerDay: 25 },
  pro: { requestsPerDay: 500 },
  team: { requestsPerDay: 500 },
};

export const FREE_MODES: Mode[] = [
  "compress",
  "enhance",
  "rewrite",
  "tone",
  "qa",
  "template",
];
```

- [ ] **Step 6: Create packages/core/src/prompts.ts**

```typescript
import type { Mode, TargetModel, Tone } from "./types";

const MODEL_HINTS: Record<TargetModel, string> = {
  gpt4o: "Format for GPT-4o: use markdown headers and bullet points for structure.",
  claude:
    "Format for Claude: wrap sections in XML tags like <context>, <task>, <format>.",
  gemini:
    "Format for Gemini: use numbered steps and explicit output format specification.",
  midjourney:
    "Format for Midjourney: output comma-separated visual descriptors, style keywords, and camera/lighting terms. Keep under 60 words.",
  auto: "Format for general LLM use.",
};

export function buildSystemPrompt(
  mode: Mode,
  targetModel: TargetModel,
  tone?: Tone
): string {
  const modelHint = MODEL_HINTS[targetModel];

  const modeInstructions: Record<Mode, string> = {
    compress: `You are a prompt compression expert. Remove filler words, hedging language ("I think", "maybe", "please"), redundancy, and unnecessary context while preserving 100% of the original intent. Return ONLY the compressed prompt — no explanation, no preamble. Target 30-55% token reduction.`,

    enhance: `You are a prompt engineering expert. Restructure the prompt to include: a role definition, clear task description, output format specification, and relevant constraints. Return ONLY the enhanced prompt — no explanation, no preamble.`,

    rewrite: `You are a prompt clarity expert. Rewrite the prompt to be precise, unambiguous, and direct. Remove vague language. Specify expected output format explicitly. Return ONLY the rewritten prompt — no explanation.`,

    tone: `You are a tone-adjustment expert. Rewrite the prompt in the specified tone: ${tone ?? "formal"}. Keep the original meaning. Return ONLY the tone-adjusted prompt — no explanation.`,

    qa: `You are a prompt engineering expert. The user will provide a prompt and answers to clarifying questions. Use their answers to build a precise, structured prompt. Return ONLY the final optimized prompt — no explanation.`,

    template: `You are a prompt template specialist. Fill in the template placeholders with contextually appropriate values based on the user's prompt. Return ONLY the completed prompt — no explanation.`,
  };

  return `${modeInstructions[mode]}\n\n${modelHint}`;
}
```

- [ ] **Step 7: Create packages/core/src/index.ts**

```typescript
export * from "./types";
export * from "./prompts";
```

- [ ] **Step 8: Create packages/core/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 9: Write tests for types and prompts**

Create `packages/core/src/prompts.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./prompts";

describe("buildSystemPrompt", () => {
  it("compress mode includes token reduction target", () => {
    const prompt = buildSystemPrompt("compress", "auto");
    expect(prompt).toContain("30-55%");
    expect(prompt).toContain("compressed prompt");
  });

  it("enhance mode includes role definition instruction", () => {
    const prompt = buildSystemPrompt("enhance", "auto");
    expect(prompt).toContain("role definition");
  });

  it("claude target includes XML tag instruction", () => {
    const prompt = buildSystemPrompt("rewrite", "claude");
    expect(prompt).toContain("XML tags");
  });

  it("midjourney target includes comma-separated instruction", () => {
    const prompt = buildSystemPrompt("compress", "midjourney");
    expect(prompt).toContain("comma-separated");
  });

  it("tone mode includes the tone parameter", () => {
    const prompt = buildSystemPrompt("tone", "auto", "casual");
    expect(prompt).toContain("casual");
  });
});
```

- [ ] **Step 10: Run tests**

```bash
cd packages/core && npx vitest run
```

Expected: 5 tests pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold turborepo monorepo with core types and system prompts"
```

---

### Task 2: Convex Backend Setup

**Files:**
- Create: `packages/convex/package.json`
- Create: `packages/convex/convex/schema.ts`
- Create: `packages/convex/convex/users.ts`
- Create: `packages/convex/convex/prompts.ts`
- Create: `packages/convex/convex/templates.ts`
- Create: `packages/convex/convex/workspaces.ts`
- Create: `packages/convex/convex/usageLogs.ts`

- [ ] **Step 1: Create packages/convex directory and init**

```bash
mkdir packages/convex && cd packages/convex
npm init -y
npm install convex @promptforge/core
npx convex dev --once
```

Follow prompts: create new Convex project named "promptforge".

- [ ] **Step 2: Create packages/convex/package.json**

```json
{
  "name": "@promptforge/convex",
  "version": "0.0.1",
  "scripts": {
    "dev": "convex dev",
    "deploy": "convex deploy"
  },
  "dependencies": {
    "convex": "^1.12.0",
    "@promptforge/core": "*"
  }
}
```

- [ ] **Step 3: Create convex/schema.ts**

```typescript
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
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"])
    .index("by_apiKey", ["apiKey"]),

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
  }).index("by_userId", ["userId"])
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
  }).index("by_isPublic", ["isPublic"])
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
  }).index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"]),

  usageLogs: defineTable({
    userId: v.id("users"),
    mode: v.string(),
    tokensIn: v.number(),
    tokensOut: v.number(),
    savedTokens: v.number(),
    source: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),
});
```

- [ ] **Step 4: Create convex/users.ts**

```typescript
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_LIMITS } from "@promptforge/core";

export const upsertUser = internalMutation({
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
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const midnight = new Date();
    midnight.setUTCHours(0, 0, 0, 0);

    // Reset daily usage if past midnight
    if (user.dailyReset < midnight.getTime()) {
      await ctx.db.patch(userId, { dailyUsage: 0, dailyReset: now });
      user.dailyUsage = 0;
    }

    const limit = PLAN_LIMITS[user.plan].requestsPerDay;
    if (user.dailyUsage >= limit) {
      throw new Error(`Daily limit reached (${limit} requests/day on ${user.plan} plan)`);
    }

    await ctx.db.patch(userId, { dailyUsage: user.dailyUsage + 1 });
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
    if (user.plan === "free") throw new Error("API access requires Pro plan");

    const apiKey = `pf_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;

    await ctx.db.patch(user._id, { apiKey });
    return apiKey;
  },
});
```

- [ ] **Step 5: Create convex/prompts.ts**

```typescript
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

    let q = ctx.db
      .query("prompts")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
      .order("desc");

    const results = await q.take(200);

    const filtered = mode
      ? results.filter((p) => p.mode === mode)
      : results;

    return filtered.slice(0, limit);
  },
});

export const deletePrompt = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, { promptId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const prompt = await ctx.db.get(promptId);
    if (!prompt) throw new Error("Not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || prompt.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(promptId);
  },
});
```

- [ ] **Step 6: Create convex/templates.ts**

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listPublic = query({
  args: {
    search: v.optional(v.string()),
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
    if (targetModel) templates = templates.filter((t) => t.targetModel === targetModel);

    return templates
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
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

    // Free plan: max 5 private templates
    if (!args.isPublic && user.plan === "free") {
      const existing = await ctx.db
        .query("templates")
        .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
        .collect();
      if (existing.filter((t) => !t.isPublic).length >= 5) {
        throw new Error("Free plan limited to 5 private templates. Upgrade to Pro.");
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

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(templateId, {
        votes: Math.max(0, (await ctx.db.get(templateId))!.votes - 1),
      });
    } else {
      await ctx.db.insert("templateVotes", { templateId, userId: user._id });
      await ctx.db.patch(templateId, {
        votes: (await ctx.db.get(templateId))!.votes + 1,
      });
    }
  },
});
```

- [ ] **Step 7: Create convex/usageLogs.ts**

```typescript
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
```

- [ ] **Step 8: Deploy Convex schema**

```bash
cd packages/convex && npx convex dev --once
```

Expected: Schema deployed, tables created.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Convex schema, users, prompts, templates, usage log queries"
```

---

### Task 3: Convex Optimize Action (AI Integration)

**Files:**
- Create: `packages/convex/convex/optimize.ts`
- Create: `packages/convex/convex/http.ts`

- [ ] **Step 1: Install OpenAI in Convex package**

```bash
cd packages/convex && npm install openai
```

- [ ] **Step 2: Create convex/optimize.ts**

```typescript
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { buildSystemPrompt } from "@promptforge/core";
import type { Mode, TargetModel, Tone, Source } from "@promptforge/core";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function selectModel(mode: Mode): string {
  // qa and enhance need full reasoning
  if (mode === "qa" || mode === "enhance") return "gpt-4o";
  return "gpt-4o-mini";
}

function countTokensApprox(text: string): number {
  // ~4 chars per token approximation
  return Math.ceil(text.length / 4);
}

export const optimizePrompt = action({
  args: {
    prompt: v.string(),
    mode: v.union(
      v.literal("compress"),
      v.literal("enhance"),
      v.literal("rewrite"),
      v.literal("tone"),
      v.literal("qa"),
      v.literal("template")
    ),
    targetModel: v.union(
      v.literal("gpt4o"),
      v.literal("claude"),
      v.literal("gemini"),
      v.literal("midjourney"),
      v.literal("auto")
    ),
    tone: v.optional(
      v.union(
        v.literal("formal"),
        v.literal("casual"),
        v.literal("technical"),
        v.literal("creative"),
        v.literal("persuasive")
      )
    ),
    source: v.union(
      v.literal("extension"),
      v.literal("desktop"),
      v.literal("web"),
      v.literal("api")
    ),
  },
  handler: async (ctx, { prompt, mode, targetModel, tone, source }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Get user and check limits
    const user: any = await ctx.runMutation(internal.users.checkAndIncrementUsage, {
      userId: identity.subject as any,
    });

    const systemPrompt = buildSystemPrompt(mode, targetModel, tone);
    const model = selectModel(mode);

    const messages: OpenAI.ChatCompletionMessageParam[] =
      mode === "qa"
        ? [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Here is my prompt: "${prompt}"\n\nAsk me 3 clarifying questions to better understand my needs. Number them 1-3.`,
            },
          ]
        : [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ];

    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.3,
    });

    const optimized = response.choices[0].message.content ?? "";
    const tokensIn = countTokensApprox(prompt);
    const tokensOut = countTokensApprox(optimized);
    const savedTokens = Math.max(0, tokensIn - tokensOut);

    // Log usage and save to history
    await ctx.runMutation(internal.optimize.savePromptAndLog, {
      clerkId: identity.subject,
      original: prompt,
      optimized,
      mode,
      targetModel,
      tokensIn,
      tokensOut,
      savedTokens,
      source,
    });

    return { optimized, tokensIn, tokensOut, savedTokens };
  },
});

export const savePromptAndLog = internalMutation({
  args: {
    clerkId: v.string(),
    original: v.string(),
    optimized: v.string(),
    mode: v.string(),
    targetModel: v.string(),
    tokensIn: v.number(),
    tokensOut: v.number(),
    savedTokens: v.number(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return;

    await ctx.db.insert("prompts", {
      userId: user._id,
      original: args.original,
      optimized: args.optimized,
      mode: args.mode as any,
      targetModel: args.targetModel as any,
      tokensIn: args.tokensIn,
      tokensOut: args.tokensOut,
      savedTokens: args.savedTokens,
      source: args.source as any,
      createdAt: Date.now(),
    });

    await ctx.db.insert("usageLogs", {
      userId: user._id,
      mode: args.mode,
      tokensIn: args.tokensIn,
      tokensOut: args.tokensOut,
      savedTokens: args.savedTokens,
      source: args.source,
      createdAt: Date.now(),
    });
  },
});

// API endpoint action (auth via API key header)
export const optimizeViaApi = action({
  args: {
    apiKey: v.string(),
    prompt: v.string(),
    mode: v.string(),
    targetModel: v.optional(v.string()),
  },
  handler: async (ctx, { apiKey, prompt, mode, targetModel = "auto" }) => {
    const user: any = await ctx.runMutation(internal.users.getUserByApiKey, { apiKey });
    if (!user) throw new Error("Invalid API key");
    if (user.plan === "free") throw new Error("API access requires Pro plan");

    const systemPrompt = buildSystemPrompt(mode as Mode, targetModel as TargetModel);
    const model = selectModel(mode as Mode);

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const optimized = response.choices[0].message.content ?? "";
    const tokensIn = Math.ceil(prompt.length / 4);
    const tokensOut = Math.ceil(optimized.length / 4);
    const savedTokens = Math.max(0, tokensIn - tokensOut);

    await ctx.runMutation(internal.optimize.savePromptAndLog, {
      clerkId: user.clerkId,
      original: prompt,
      optimized,
      mode: "api",
      targetModel,
      tokensIn,
      tokensOut,
      savedTokens,
      source: "api",
    });

    return { optimized, tokensIn, tokensOut, savedTokens };
  },
});
```

- [ ] **Step 3: Create convex/http.ts (REST API endpoint)**

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/v1/optimize",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { prompt, mode = "compress", targetModel = "auto" } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const result = await ctx.runAction(api.optimize.optimizeViaApi, {
        apiKey,
        prompt,
        mode,
        targetModel,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

http.route({
  path: "/v1/optimize",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }),
});

export default http;
```

- [ ] **Step 4: Add OPENAI_API_KEY to Convex environment**

```bash
cd packages/convex && npx convex env set OPENAI_API_KEY sk-your-key-here
```

- [ ] **Step 5: Deploy**

```bash
npx convex deploy
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Convex optimize action with OpenAI integration and REST API endpoint"
```

---

## Phase 2: Next.js Web Dashboard

---

### Task 4: Next.js App Scaffold + Clerk Auth

**Files:**
- Create: `apps/web/` (scaffolded)
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/providers.tsx`
- Create: `apps/web/middleware.ts`
- Create: `apps/web/.env.local`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd apps && npx create-next-app@latest web \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*"
```

- [ ] **Step 2: Install dependencies**

```bash
cd apps/web
npm install @clerk/nextjs convex @clerk/clerk-react
npm install @promptforge/core @promptforge/convex
```

- [ ] **Step 3: Create apps/web/app/providers.tsx**

```typescript
"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

- [ ] **Step 4: Update apps/web/app/layout.tsx**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromptForge — Better Prompts. Less Tokens.",
  description:
    "Compress, enhance, and optimize AI prompts in one keystroke. Browser extension + desktop app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Create apps/web/middleware.ts**

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 6: Create apps/web/.env.local**

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
STRIPE_SECRET_KEY=sk_test_your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret
```

- [ ] **Step 7: Run dev server and verify auth redirect works**

```bash
cd apps/web && npm run dev
```

Open http://localhost:3000/dashboard — should redirect to sign-in.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js web app with Clerk + Convex auth"
```

---

### Task 5: Shared UI Package (shadcn components)

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/src/components/UsageBar.tsx`
- Create: `packages/ui/src/components/PlanBadge.tsx`
- Create: `packages/ui/src/components/ModeButton.tsx`
- Create: `packages/ui/src/components/PromptDiff.tsx`
- Create: `packages/ui/src/components/TemplateCard.tsx`
- Create: `packages/ui/src/index.ts`

- [ ] **Step 1: Create packages/ui/package.json**

```json
{
  "name": "@promptforge/ui",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^18.0.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^16.0.0",
    "jsdom": "^24.0.0"
  }
}
```

- [ ] **Step 2: Create packages/ui/src/components/UsageBar.tsx**

```typescript
import { clsx } from "clsx";

interface UsageBarProps {
  used: number;
  limit: number;
  className?: string;
}

export function UsageBar({ used, limit, className }: UsageBarProps) {
  const pct = Math.min((used / limit) * 100, 100);
  const color =
    pct >= 90
      ? "bg-red-500"
      : pct >= 70
        ? "bg-yellow-500"
        : "bg-emerald-500";

  return (
    <div className={clsx("w-full", className)}>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{used} used</span>
        <span>{limit}/day</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create packages/ui/src/components/PlanBadge.tsx**

```typescript
import { clsx } from "clsx";
import type { Plan } from "@promptforge/core";

const STYLES: Record<Plan, string> = {
  free: "bg-gray-100 text-gray-700",
  pro: "bg-violet-100 text-violet-700",
  team: "bg-blue-100 text-blue-700",
};

const LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
        STYLES[plan]
      )}
    >
      {LABELS[plan]}
    </span>
  );
}
```

- [ ] **Step 4: Create packages/ui/src/components/ModeButton.tsx**

```typescript
import { clsx } from "clsx";
import type { Mode } from "@promptforge/core";

const MODE_META: Record<
  Mode,
  { label: string; description: string; shortcut: string; emoji: string }
> = {
  compress: {
    label: "Compress",
    description: "Remove filler, save tokens",
    shortcut: "⌃⇧1",
    emoji: "⚡",
  },
  enhance: {
    label: "Enhance",
    description: "Add structure & context",
    shortcut: "⌃⇧2",
    emoji: "✨",
  },
  rewrite: {
    label: "Rewrite",
    description: "Clarity & precision",
    shortcut: "⌃⇧3",
    emoji: "✏️",
  },
  tone: {
    label: "Tone",
    description: "Adjust writing style",
    shortcut: "⌃⇧4",
    emoji: "🎭",
  },
  qa: {
    label: "Q&A",
    description: "Answer questions → perfect prompt",
    shortcut: "⌃⇧5",
    emoji: "💬",
  },
  template: {
    label: "Template",
    description: "Use a prompt template",
    shortcut: "⌃⇧6",
    emoji: "📋",
  },
};

interface ModeButtonProps {
  mode: Mode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  compact?: boolean;
}

export function ModeButton({
  mode,
  onClick,
  disabled,
  active,
  compact,
}: ModeButtonProps) {
  const meta = MODE_META[mode];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all",
        "border border-transparent hover:border-gray-200",
        active
          ? "bg-violet-50 border-violet-200 text-violet-700"
          : "hover:bg-gray-50 text-gray-700",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span className="text-lg">{meta.emoji}</span>
      {!compact && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">{meta.label}</span>
            <span className="text-xs text-gray-400 font-mono">{meta.shortcut}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">{meta.description}</p>
        </div>
      )}
    </button>
  );
}
```

- [ ] **Step 5: Create packages/ui/src/components/PromptDiff.tsx**

```typescript
interface PromptDiffProps {
  original: string;
  optimized: string;
  tokensIn: number;
  tokensOut: number;
  savedTokens: number;
}

export function PromptDiff({
  original,
  optimized,
  tokensIn,
  tokensOut,
  savedTokens,
}: PromptDiffProps) {
  const pctSaved = tokensIn > 0 ? Math.round((savedTokens / tokensIn) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex gap-3 text-sm font-medium text-center">
        <div className="flex-1 bg-red-50 text-red-700 rounded px-3 py-1">
          Before: ~{tokensIn} tokens
        </div>
        <div className="flex-1 bg-green-50 text-green-700 rounded px-3 py-1">
          After: ~{tokensOut} tokens ({pctSaved > 0 ? `-${pctSaved}%` : `+${Math.abs(pctSaved)}%`})
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">Original</p>
          <div className="bg-gray-50 border rounded p-3 text-sm text-gray-600 max-h-40 overflow-auto whitespace-pre-wrap">
            {original}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Optimized</p>
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-gray-800 max-h-40 overflow-auto whitespace-pre-wrap">
            {optimized}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create packages/ui/src/components/TemplateCard.tsx**

```typescript
interface Template {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  targetModel: string;
  votes: number;
  usageCount: number;
}

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
  onVote?: (templateId: string) => void;
  hasVoted?: boolean;
}

export function TemplateCard({
  template,
  onUse,
  onVote,
  hasVoted,
}: TemplateCardProps) {
  return (
    <div className="border rounded-xl p-4 hover:border-violet-300 transition-colors bg-white">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm text-gray-900 leading-tight">
          {template.title}
        </h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded shrink-0">
          {template.targetModel}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        {template.description}
      </p>
      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <button
            onClick={() => onVote?.(template._id)}
            className={`flex items-center gap-1 hover:text-violet-600 transition-colors ${hasVoted ? "text-violet-600" : ""}`}
          >
            ▲ {template.votes}
          </button>
          <span>· {template.usageCount} uses</span>
        </div>
        <button
          onClick={() => onUse(template)}
          className="text-xs bg-violet-600 text-white px-3 py-1 rounded-lg hover:bg-violet-700 transition-colors"
        >
          Use
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create packages/ui/src/index.ts**

```typescript
export { UsageBar } from "./components/UsageBar";
export { PlanBadge } from "./components/PlanBadge";
export { ModeButton } from "./components/ModeButton";
export { PromptDiff } from "./components/PromptDiff";
export { TemplateCard } from "./components/TemplateCard";
```

- [ ] **Step 8: Write component tests**

Create `packages/ui/src/components/UsageBar.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UsageBar } from "./UsageBar";

describe("UsageBar", () => {
  it("shows used and limit", () => {
    render(<UsageBar used={10} limit={25} />);
    expect(screen.getByText("10 used")).toBeTruthy();
    expect(screen.getByText("25/day")).toBeTruthy();
  });

  it("caps at 100% visually", () => {
    const { container } = render(<UsageBar used={30} limit={25} />);
    const bar = container.querySelector("[style]");
    expect(bar?.getAttribute("style")).toContain("100%");
  });
});
```

- [ ] **Step 9: Run tests**

```bash
cd packages/ui && npx vitest run
```

Expected: 2 tests pass.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add shared UI components (UsageBar, PlanBadge, ModeButton, PromptDiff, TemplateCard)"
```

---

### Task 6: Web Dashboard Core Pages

**Files:**
- Create: `apps/web/app/page.tsx` (landing)
- Create: `apps/web/app/pricing/page.tsx`
- Create: `apps/web/app/dashboard/page.tsx`
- Create: `apps/web/app/dashboard/layout.tsx`
- Create: `apps/web/app/dashboard/history/page.tsx`
- Create: `apps/web/app/dashboard/library/page.tsx`
- Create: `apps/web/app/dashboard/settings/page.tsx`

- [ ] **Step 1: Create apps/web/app/page.tsx (landing)**

```typescript
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-bold text-xl">⚡ PromptForge</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">
                Get Started Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          ⚡ The Tokavy killer
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Better Prompts.
          <br />
          <span className="text-violet-600">Less Tokens.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          6 optimization modes. Browser extension for Chrome, Firefox, and Edge.
          Desktop app for Windows, macOS, and Linux. One keystroke — any app.
        </p>
        <div className="flex items-center justify-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-violet-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-violet-700">
                Get Started Free — 25 req/day
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-violet-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-violet-700"
            >
              Open Dashboard
            </Link>
          </SignedIn>
          <Link
            href="/pricing"
            className="text-gray-600 px-6 py-3 rounded-xl text-base font-medium hover:text-gray-900"
          >
            See pricing →
          </Link>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          vs. Tokavy
        </h2>
        <div className="border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Feature</th>
                <th className="text-center px-6 py-3 font-semibold text-violet-700">PromptForge</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500">Tokavy</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                ["Browser Extension", "✅ Chrome + Firefox + Edge", "❌"],
                ["Desktop App", "✅ Win + Mac + Linux", "✅ Windows only"],
                ["Optimization modes", "6 modes", "2 modes"],
                ["Free requests/day", "25", "10"],
                ["Pro requests/day", "500 @ $9/mo", "100"],
                ["Template library", "✅ 500+", "❌"],
                ["Multi-model targeting", "✅ GPT-4o, Claude, Gemini, Midjourney", "❌"],
                ["Developer API", "✅", "❌"],
                ["Team workspace", "✅", "❌"],
              ].map(([feature, us, them]) => (
                <tr key={feature} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">{feature}</td>
                  <td className="px-6 py-3 text-center text-green-700 font-medium">{us}</td>
                  <td className="px-6 py-3 text-center text-gray-400">{them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Create apps/web/app/dashboard/layout.tsx**

```typescript
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Dashboard", emoji: "📊" },
  { href: "/dashboard/library", label: "Library", emoji: "📚" },
  { href: "/dashboard/history", label: "History", emoji: "🕐" },
  { href: "/dashboard/team", label: "Team", emoji: "👥" },
  { href: "/dashboard/api", label: "API", emoji: "⚙️" },
  { href: "/dashboard/settings", label: "Settings", emoji: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="px-4 py-5 font-bold text-lg border-b">⚡ PromptForge</div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <UserButton afterSignOutUrl="/" showName />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create apps/web/app/dashboard/page.tsx**

```typescript
"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { UsageBar, PlanBadge, ModeButton, PromptDiff } from "@promptforge/ui";
import { useState } from "react";
import type { Mode, TargetModel } from "@promptforge/core";

export default function DashboardPage() {
  const user = useQuery(api.users.getMe);
  const stats = useQuery(api.usageLogs.getStats, { days: 30 });
  const optimize = useAction(api.optimize.optimizePrompt);

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<Mode>("compress");
  const [targetModel, setTargetModel] = useState<TargetModel>("auto");
  const [result, setResult] = useState<{
    optimized: string;
    tokensIn: number;
    tokensOut: number;
    savedTokens: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modes: Mode[] = ["compress", "enhance", "rewrite", "tone", "qa", "template"];

  async function handleOptimize() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await optimize({ prompt, mode, targetModel, source: "web" });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <PlanBadge plan={user.plan} />
      </div>

      {/* Usage */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Today's Usage</h2>
          <span className="text-sm text-gray-500">
            Resets at midnight UTC
          </span>
        </div>
        <UsageBar used={user.dailyUsage} limit={user.plan === "free" ? 25 : 500} />
      </div>

      {/* Quick optimize */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Quick Optimize</h2>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-2">
          {modes.map((m) => (
            <ModeButton
              key={m}
              mode={m}
              onClick={() => setMode(m)}
              active={mode === m}
            />
          ))}
        </div>

        {/* Target model */}
        <select
          value={targetModel}
          onChange={(e) => setTargetModel(e.target.value as TargetModel)}
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          <option value="auto">Auto (general LLM)</option>
          <option value="gpt4o">GPT-4o</option>
          <option value="claude">Claude</option>
          <option value="gemini">Gemini</option>
          <option value="midjourney">Midjourney</option>
        </select>

        {/* Prompt input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste your prompt here..."
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleOptimize}
          disabled={loading || !prompt.trim()}
          className="w-full bg-violet-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Optimizing..." : "Optimize →"}
        </button>

        {result && (
          <PromptDiff
            original={prompt}
            optimized={result.optimized}
            tokensIn={result.tokensIn}
            tokensOut={result.tokensOut}
            savedTokens={result.savedTokens}
          />
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-violet-600">{stats.totalRequests}</div>
            <div className="text-sm text-gray-500 mt-1">Total optimizations</div>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.totalSavedTokens.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">Tokens saved</div>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              ${stats.estimatedSavedCost.toFixed(3)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Estimated saved</div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create apps/web/app/dashboard/history/page.tsx**

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { useState } from "react";
import type { Mode } from "@promptforge/core";

const MODE_LABELS: Record<string, string> = {
  compress: "⚡ Compress",
  enhance: "✨ Enhance",
  rewrite: "✏️ Rewrite",
  tone: "🎭 Tone",
  qa: "💬 Q&A",
  template: "📋 Template",
  api: "⚙️ API",
};

export default function HistoryPage() {
  const [filterMode, setFilterMode] = useState<string>("");
  const history = useQuery(api.prompts.getHistory, {
    limit: 50,
    mode: filterMode || undefined,
  });
  const deletePrompt = useMutation(api.prompts.deletePrompt);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All modes</option>
          {Object.entries(MODE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {history?.map((item) => (
          <div key={item._id} className="bg-white border rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded font-medium">
                  {MODE_LABELS[item.mode] ?? item.mode}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <span className="text-xs text-green-600">
                  -{item.savedTokens} tokens
                </span>
              </div>
              <button
                onClick={() => deletePrompt({ promptId: item._id })}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Original</p>
                <p className="text-gray-600 line-clamp-3 bg-gray-50 rounded p-2">
                  {item.original}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Optimized</p>
                <p className="text-gray-800 line-clamp-3 bg-green-50 rounded p-2">
                  {item.optimized}
                </p>
              </div>
            </div>
          </div>
        ))}

        {history?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No optimizations yet. Try optimizing a prompt from the dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create apps/web/app/dashboard/library/page.tsx**

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { TemplateCard } from "@promptforge/ui";
import { useState } from "react";

export default function LibraryPage() {
  const [tab, setTab] = useState<"community" | "mine">("community");
  const [tagFilter, setTagFilter] = useState("");

  const community = useQuery(api.templates.listPublic, {
    tag: tagFilter || undefined,
    limit: 50,
  });
  const mine = useQuery(api.templates.listMine);
  const vote = useMutation(api.templates.voteTemplate);

  const templates = tab === "community" ? community : mine;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
        <button className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">
          + New Template
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex border rounded-lg overflow-hidden">
          {(["community", "mine"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "community" ? "Community" : "My Templates"}
            </button>
          ))}
        </div>
        {tab === "community" && (
          <input
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="Filter by tag..."
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 w-48"
          />
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template) => (
          <TemplateCard
            key={template._id}
            template={template}
            onUse={(t) => {
              navigator.clipboard.writeText(t.content);
              alert("Template copied to clipboard!");
            }}
            onVote={(id) => vote({ templateId: id as any })}
          />
        ))}
      </div>

      {templates?.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          {tab === "community"
            ? "No community templates yet. Be the first!"
            : "No templates yet. Create your first template above."}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create apps/web/app/pricing/page.tsx**

```typescript
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "border-gray-200",
    badgeColor: "bg-gray-100 text-gray-700",
    features: [
      "25 optimizations/day",
      "All 6 optimization modes",
      "Chrome, Firefox, Edge extension",
      "Desktop app (Win/Mac/Linux)",
      "5 private templates",
      "7-day history",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    color: "border-violet-300 ring-2 ring-violet-200",
    badgeColor: "bg-violet-100 text-violet-700",
    features: [
      "500 optimizations/day",
      "All 6 optimization modes",
      "Chrome, Firefox, Edge extension",
      "Desktop app (Win/Mac/Linux)",
      "100 private templates",
      "Developer API access",
      "90-day history",
      "Priority routing",
    ],
    cta: "Start Pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$25",
    period: "per seat/month",
    color: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    features: [
      "500 optimizations/seat/day",
      "Everything in Pro",
      "Team workspace",
      "Shared template library",
      "Usage analytics by member",
      "Unlimited private templates",
      "1-year history",
      "Admin controls",
    ],
    cta: "Start Team Trial",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b">
        <Link href="/" className="font-bold text-xl">⚡ PromptForge</Link>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-center text-gray-500 mb-12">
          No tricks. 7-day money-back guarantee on Pro.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-2xl p-6 relative ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-4 ${plan.badgeColor}`}
              >
                {plan.name}
              </span>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <SignInButton mode="modal">
                <button
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.popular
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </button>
              </SignInButton>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 7: Create apps/web/app/dashboard/settings/page.tsx**

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { PlanBadge } from "@promptforge/ui";
import { useState } from "react";

export default function SettingsPage() {
  const user = useQuery(api.users.getMe);
  const generateKey = useMutation(api.users.generateApiKey);
  const [apiKey, setApiKey] = useState<string | null>(null);

  async function handleGenerateKey() {
    try {
      const key = await generateKey();
      setApiKey(key);
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (!user) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Plan */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <PlanBadge plan={user.plan} />
            <p className="text-sm text-gray-500 mt-1">
              {user.plan === "free"
                ? "25 optimizations/day"
                : user.plan === "pro"
                  ? "500 optimizations/day"
                  : "500 optimizations/seat/day"}
            </p>
          </div>
          {user.plan === "free" && (
            <a
              href="/pricing"
              className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
            >
              Upgrade to Pro →
            </a>
          )}
        </div>
      </div>

      {/* API Key */}
      {user.plan !== "free" && (
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Developer API</h2>
          {user.apiKey ? (
            <div>
              <p className="text-sm text-gray-500 mb-2">Your API key:</p>
              <code className="block bg-gray-50 border rounded-lg px-3 py-2 text-sm font-mono text-gray-800 break-all">
                {apiKey ?? user.apiKey}
              </code>
            </div>
          ) : (
            <div>
              {apiKey ? (
                <div>
                  <p className="text-sm text-green-600 mb-2">
                    API key generated. Save it — it won't be shown again:
                  </p>
                  <code className="block bg-gray-50 border rounded-lg px-3 py-2 text-sm font-mono text-gray-800 break-all">
                    {apiKey}
                  </code>
                </div>
              ) : (
                <button
                  onClick={handleGenerateKey}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900"
                >
                  Generate API Key
                </button>
              )}
            </div>
          )}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono">
            {`POST https://api.promptforge.app/v1/optimize\nAuthorization: Bearer pf_your_key\n{ "prompt": "...", "mode": "compress" }`}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Verify dashboard renders**

```bash
cd apps/web && npm run dev
```

Open http://localhost:3000 → sign in → verify /dashboard loads with usage bar and mode buttons.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add web dashboard (landing, pricing, dashboard, history, library, settings)"
```

---

## Phase 3: Browser Extension (Plasmo)

---

### Task 7: Plasmo Extension Scaffold + Popup

**Files:**
- Create: `apps/extension/` (scaffolded via Plasmo)
- Create: `apps/extension/popup.tsx`
- Create: `apps/extension/package.json`
- Create: `apps/extension/background.ts`

- [ ] **Step 1: Scaffold Plasmo extension**

```bash
cd apps && npx create-plasmo extension --with-src
cd extension
npm install convex @clerk/clerk-react @promptforge/core @promptforge/ui
```

- [ ] **Step 2: Update apps/extension/package.json manifest fields**

Add to `package.json`:
```json
{
  "name": "promptforge-extension",
  "displayName": "PromptForge — AI Prompt Optimizer",
  "version": "1.0.0",
  "description": "Compress, enhance and optimize AI prompts with one keystroke",
  "manifest": {
    "permissions": ["activeTab", "storage", "contextMenus"],
    "host_permissions": ["<all_urls>"]
  }
}
```

- [ ] **Step 3: Create apps/extension/popup.tsx**

```typescript
import { useState, useEffect } from "react";
import { ConvexReactClient } from "convex/react";
import { useQuery, useAction, ConvexProvider } from "convex/react";
import { UsageBar, PlanBadge, ModeButton } from "@promptforge/ui";
import type { Mode, TargetModel } from "@promptforge/core";

const convex = new ConvexReactClient(process.env.PLASMO_PUBLIC_CONVEX_URL!);

function PopupContent() {
  const [mode, setMode] = useState<Mode>("compress");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const modes: Mode[] = ["compress", "enhance", "rewrite", "tone", "qa", "template"];

  async function handleMode(selectedMode: Mode) {
    setMode(selectedMode);
    setStatus("loading");
    setError(null);

    // Send message to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    chrome.tabs.sendMessage(
      tab.id,
      { type: "OPTIMIZE", mode: selectedMode, targetModel: "auto" },
      (response) => {
        if (chrome.runtime.lastError) {
          setError("No text selected. Select text on the page first.");
          setStatus("error");
          return;
        }
        if (response?.success) {
          setStatus("done");
          setTimeout(() => setStatus("idle"), 2000);
        } else {
          setError(response?.error ?? "Failed to optimize");
          setStatus("error");
        }
      }
    );
  }

  return (
    <div className="w-80 bg-white p-4 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-base">⚡ PromptForge</span>
        <a
          href="https://promptforge.app/dashboard"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gray-400 hover:text-violet-600"
        >
          Dashboard →
        </a>
      </div>

      {/* Status feedback */}
      {status === "done" && (
        <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">
          ✓ Prompt optimized and replaced!
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Instructions */}
      {status === "idle" && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          Select text in any AI app, then click a mode or use Ctrl+Shift+1–6
        </p>
      )}

      {/* Mode buttons */}
      <div className="space-y-1">
        {modes.map((m) => (
          <ModeButton
            key={m}
            mode={m}
            onClick={() => handleMode(m)}
            disabled={status === "loading"}
            active={mode === m && status === "loading"}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t">
        <a
          href="https://promptforge.app/pricing"
          target="_blank"
          rel="noreferrer"
          className="block text-center text-xs text-violet-600 hover:underline"
        >
          Upgrade for 500 req/day →
        </a>
      </div>
    </div>
  );
}

export default function Popup() {
  return (
    <ConvexProvider client={convex}>
      <PopupContent />
    </ConvexProvider>
  );
}
```

- [ ] **Step 4: Create apps/extension/.env.local**

```bash
PLASMO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
```

- [ ] **Step 5: Run extension in dev mode**

```bash
cd apps/extension && npm run dev
```

Open Chrome → `chrome://extensions` → Load unpacked → select `build/chrome-mv3-dev`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Plasmo browser extension scaffold and popup UI"
```

---

### Task 8: Extension Content Script (Inline Replace)

**Files:**
- Create: `apps/extension/contents/optimizer.tsx`
- Create: `apps/extension/background.ts`

- [ ] **Step 1: Create apps/extension/contents/optimizer.tsx**

```typescript
import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
};

// Get selected text from any editable element
function getSelectedText(): { text: string; element: Element | null } {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return { text: "", element: null };

  const text = sel.toString().trim();
  const range = sel.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const element =
    container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : (container as Element);

  return { text, element };
}

// Replace selected text in any editable element
function replaceSelectedText(replacement: string): boolean {
  const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;

  // textarea / input
  if (
    activeEl &&
    (activeEl.tagName === "TEXTAREA" || activeEl.tagName === "INPUT") &&
    typeof activeEl.selectionStart === "number"
  ) {
    const start = activeEl.selectionStart!;
    const end = activeEl.selectionEnd!;
    const value = activeEl.value;
    activeEl.value = value.slice(0, start) + replacement + value.slice(end);
    activeEl.selectionStart = activeEl.selectionEnd = start + replacement.length;

    // Trigger React's synthetic event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    nativeInputValueSetter?.call(activeEl, activeEl.value);
    activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }

  // contenteditable (ChatGPT, Claude, Notion, etc.)
  const sel = window.getSelection();
  if (sel && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(replacement));
    sel.collapseToEnd();
    document.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }

  return false;
}

// Listen for messages from popup / background
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "OPTIMIZE") {
    sendResponse({ success: false, error: "Unknown message type" });
    return true;
  }

  const { text } = getSelectedText();
  if (!text) {
    sendResponse({ success: false, error: "No text selected" });
    return true;
  }

  // Call Convex via background service worker (avoids CORS)
  chrome.runtime.sendMessage(
    {
      type: "CONVEX_OPTIMIZE",
      prompt: text,
      mode: msg.mode,
      targetModel: msg.targetModel ?? "auto",
    },
    (response) => {
      if (response?.optimized) {
        const replaced = replaceSelectedText(response.optimized);
        sendResponse({ success: replaced, error: replaced ? null : "Could not replace text" });
      } else {
        sendResponse({ success: false, error: response?.error ?? "Optimization failed" });
      }
    }
  );

  return true; // keep channel open for async response
});

// Keyboard shortcuts (Ctrl+Shift+1 through Ctrl+Shift+6)
const SHORTCUT_MODES: Record<string, string> = {
  "1": "compress",
  "2": "enhance",
  "3": "rewrite",
  "4": "tone",
  "5": "qa",
  "6": "template",
};

document.addEventListener("keydown", (e) => {
  if (!e.ctrlKey || !e.shiftKey) return;
  const mode = SHORTCUT_MODES[e.key];
  if (!mode) return;

  e.preventDefault();

  const { text } = getSelectedText();
  if (!text) return;

  chrome.runtime.sendMessage(
    { type: "CONVEX_OPTIMIZE", prompt: text, mode, targetModel: "auto" },
    (response) => {
      if (response?.optimized) {
        replaceSelectedText(response.optimized);
      } else if (response?.error) {
        console.warn("[PromptForge]", response.error);
      }
    }
  );
});
```

- [ ] **Step 2: Create apps/extension/background.ts**

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@promptforge/convex/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.PLASMO_PUBLIC_CONVEX_URL!);

// Handle optimize requests from content scripts
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "CONVEX_OPTIMIZE") return;

  const { prompt, mode, targetModel } = msg;

  // Get stored auth token
  chrome.storage.local.get(["convex_token"], async ({ convex_token }) => {
    if (!convex_token) {
      sendResponse({ error: "Not signed in. Sign in at promptforge.app" });
      return;
    }

    try {
      convex.setAuth(convex_token);
      const result = await convex.action(api.optimize.optimizePrompt, {
        prompt,
        mode,
        targetModel: targetModel ?? "auto",
        source: "extension",
      });
      sendResponse(result);
    } catch (e: any) {
      sendResponse({ error: e.message });
    }
  });

  return true; // async response
});
```

- [ ] **Step 3: Test content script in dev**

```bash
cd apps/extension && npm run dev
```

1. Load extension in Chrome
2. Go to chat.openai.com or claude.ai
3. Select text in prompt box
4. Press Ctrl+Shift+1
5. Verify text is replaced with compressed version

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add extension content script with inline replace and keyboard shortcuts"
```

---

### Task 9: Extension Build for All Browsers

**Files:**
- Modify: `apps/extension/package.json`

- [ ] **Step 1: Add build scripts for all browsers**

Update `apps/extension/package.json` scripts:

```json
{
  "scripts": {
    "dev": "plasmo dev",
    "build": "plasmo build",
    "build:firefox": "plasmo build --target=firefox-mv2",
    "build:edge": "plasmo build --target=edge-mv3",
    "build:all": "npm run build && npm run build:firefox && npm run build:edge",
    "package": "plasmo package",
    "package:firefox": "plasmo package --target=firefox-mv2"
  }
}
```

- [ ] **Step 2: Build for all targets**

```bash
cd apps/extension && npm run build:all
```

Expected: `build/chrome-mv3-prod`, `build/firefox-mv2-prod`, `build/edge-mv3-prod` directories created.

- [ ] **Step 3: Verify Firefox build loads**

Open Firefox → `about:debugging` → This Firefox → Load Temporary Add-on → select `build/firefox-mv2-prod/manifest.json`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add multi-browser extension builds (Chrome, Firefox, Edge)"
```

---

## Phase 4: Tauri Desktop App

---

### Task 10: Tauri Desktop App Scaffold

**Files:**
- Create: `apps/desktop/` (scaffolded)
- Create: `apps/desktop/src/App.tsx`
- Create: `apps/desktop/src-tauri/src/main.rs`
- Create: `apps/desktop/src-tauri/tauri.conf.json`

- [ ] **Step 1: Scaffold Tauri app**

```bash
cd apps && npm create tauri-app@latest desktop -- --template react-ts
cd desktop
npm install
npm install convex @promptforge/core @promptforge/ui
npm install @tauri-apps/plugin-global-shortcut @tauri-apps/api
```

- [ ] **Step 2: Update apps/desktop/src-tauri/Cargo.toml**

```toml
[package]
name = "promptforge"
version = "1.0.0"
edition = "2021"

[lib]
name = "promptforge_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[dependencies]
tauri = { version = "2", features = ["tray-icon", "image-ico", "image-png"] }
tauri-plugin-global-shortcut = "2"
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

- [ ] **Step 3: Update apps/desktop/src-tauri/src/main.rs**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Manager,
    tray::{TrayIconBuilder, TrayIconEvent},
    menu::{MenuBuilder, MenuItem},
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Build tray menu
            let quit = MenuItem::with_id(app, "quit", "Quit PromptForge", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Open Dashboard", true, None::<&str>)?;
            let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;

            // Create system tray
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("PromptForge")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => app.exit(0),
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            // Register global shortcuts
            let app_handle = app.handle().clone();
            let shortcuts = [
                ("Ctrl+Shift+1", "compress"),
                ("Ctrl+Shift+2", "enhance"),
                ("Ctrl+Shift+3", "rewrite"),
                ("Ctrl+Shift+4", "tone"),
                ("Ctrl+Shift+5", "qa"),
                ("Ctrl+Shift+6", "template"),
            ];

            for (shortcut_str, mode) in &shortcuts {
                let app_handle = app_handle.clone();
                let mode = mode.to_string();
                app.global_shortcut().on_shortcut(
                    shortcut_str.parse::<Shortcut>()?,
                    move |_app, _shortcut, event| {
                        if event.state == ShortcutState::Pressed {
                            app_handle
                                .emit("global-shortcut", &mode)
                                .unwrap_or_default();
                        }
                    },
                )?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 4: Create apps/desktop/src/App.tsx**

```typescript
import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { ConvexReactClient, useAction } from "convex/react";
import { ConvexProvider } from "convex/react";
import { PromptDiff, ModeButton } from "@promptforge/ui";
import type { Mode, TargetModel } from "@promptforge/core";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function OverlayContent() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("compress");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for global shortcut events from Rust
    const unlisten = listen<string>("global-shortcut", (event) => {
      setMode(event.payload as Mode);
      setVisible(true);
      setResult(null);
      setPrompt("");
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  async function handleOptimize() {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // Call Convex action via HTTP (desktop doesn't have content script)
      const res = await fetch(`${import.meta.env.VITE_CONVEX_URL}/v1/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("convex_token")}`,
        },
        body: JSON.stringify({ prompt, mode, targetModel: "auto" }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const modes: Mode[] = ["compress", "enhance", "rewrite", "tone", "qa", "template"];

  if (!visible) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚡</div>
          <h1 className="text-xl font-bold text-gray-900">PromptForge</h1>
          <p className="text-sm text-gray-500">Running in background</p>
          <p className="text-xs text-gray-400">Use Ctrl+Shift+1–6 anywhere to optimize</p>
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mt-4">
            {modes.map((m) => (
              <ModeButton key={m} mode={m} onClick={() => { setMode(m); setVisible(true); }} compact />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-900">
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Prompt
        </h2>
        <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Paste your prompt here..."
        className="w-full border rounded-xl px-4 py-3 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
        autoFocus
      />

      <button
        onClick={handleOptimize}
        disabled={loading || !prompt.trim()}
        className="w-full bg-violet-600 text-white py-2.5 rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? "Optimizing..." : "Optimize →"}
      </button>

      {result && (
        <PromptDiff
          original={prompt}
          optimized={result.optimized}
          tokensIn={result.tokensIn}
          tokensOut={result.tokensOut}
          savedTokens={result.savedTokens}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <OverlayContent />
    </ConvexProvider>
  );
}
```

- [ ] **Step 5: Create apps/desktop/.env**

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

- [ ] **Step 6: Run desktop app in dev**

```bash
cd apps/desktop && npm run tauri dev
```

Expected: Desktop window opens. Press Ctrl+Shift+1 → overlay appears.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Tauri v2 desktop app with system tray and global hotkeys"
```

---

### Task 11: Desktop Distribution Build

**Files:**
- Modify: `apps/desktop/src-tauri/tauri.conf.json`

- [ ] **Step 1: Update tauri.conf.json for distribution**

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "PromptForge",
  "version": "1.0.0",
  "identifier": "app.promptforge.desktop",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "windows": {
      "wix": {},
      "nsis": {}
    },
    "macOS": {
      "signingIdentity": null
    },
    "linux": {
      "deb": {
        "depends": ["libwebkit2gtk-4.1-0", "libayatana-appindicator3-1"]
      }
    }
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "PromptForge",
        "width": 420,
        "height": 600,
        "resizable": true,
        "visible": true
      }
    ],
    "trayIcon": {
      "iconPath": "icons/32x32.png",
      "iconAsTemplate": true
    }
  }
}
```

- [ ] **Step 2: Build for current platform**

```bash
cd apps/desktop && npm run tauri build
```

Expected: Installer created in `src-tauri/target/release/bundle/`.

- [ ] **Step 3: Verify installer works**

Run the installer, verify app starts, tray icon appears, global hotkey works.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: configure Tauri distribution build for Win/Mac/Linux"
```

---

## Phase 5: Final Polish + Launch Prep

---

### Task 12: Stripe + Razorpay Billing

**Files:**
- Create: `apps/web/app/api/webhooks/stripe/route.ts`
- Create: `apps/web/app/api/webhooks/razorpay/route.ts`
- Create: `apps/web/lib/billing.ts`

- [ ] **Step 1: Install Stripe SDK**

```bash
cd apps/web && npm install stripe @stripe/stripe-js
```

- [ ] **Step 2: Create apps/web/lib/billing.ts**

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export const STRIPE_PRICES = {
  pro_monthly: "price_pro_monthly_id",
  team_monthly: "price_team_monthly_id",
};

export async function createCheckoutSession({
  userId,
  email,
  plan,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  plan: "pro" | "team";
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    metadata: { userId, plan },
    line_items: [
      {
        price: STRIPE_PRICES[`${plan}_monthly`],
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url!;
}
```

- [ ] **Step 3: Create apps/web/app/api/webhooks/stripe/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/billing";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@promptforge/convex/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, plan } = session.metadata;

    await convex.mutation(api.users.updatePlan, {
      clerkId: userId,
      plan: plan as "pro" | "team",
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    // Downgrade to free — get user by Stripe customer ID
    // (store customerId in users table when first subscription created)
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 4: Add updatePlan mutation to packages/convex/convex/users.ts**

```typescript
export const updatePlan = mutation({
  args: {
    clerkId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team")),
  },
  handler: async (ctx, { clerkId, plan }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { plan });
  },
});
```

- [ ] **Step 5: Create checkout API route**

Create `apps/web/app/api/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCheckoutSession } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, email } = await req.json();

  const url = await createCheckoutSession({
    userId,
    email,
    plan,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return NextResponse.json({ url });
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Stripe billing with webhook handler and checkout flow"
```

---

### Task 13: End-to-End Test Suite

**Files:**
- Create: `apps/web/e2e/optimize.spec.ts`
- Create: `apps/web/e2e/auth.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
cd apps/web && npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Create playwright.config.ts**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Create apps/web/e2e/auth.spec.ts**

```typescript
import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Better Prompts")).toBeVisible();
  await expect(page.getByText("Less Tokens")).toBeVisible();
});

test("pricing page shows all 3 plans", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByText("Free")).toBeVisible();
  await expect(page.getByText("Pro")).toBeVisible();
  await expect(page.getByText("Team")).toBeVisible();
});

test("dashboard redirects unauthenticated users", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/sign-in/);
});
```

- [ ] **Step 4: Run tests**

```bash
cd apps/web && npx playwright test
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add Playwright E2E tests for landing, pricing, and auth redirect"
```

---

### Task 14: Final Git Cleanup + README

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Create root .gitignore**

```gitignore
node_modules/
.env.local
.env
dist/
build/
.next/
out/
target/
*.zip
*.tar.gz
.convex/
.plasmo/
```

- [ ] **Step 2: Create .env.example**

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI (set in Convex dashboard, not here)
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 3: Create README.md**

```markdown
# PromptForge

AI prompt optimization platform — browser extension + desktop app + web dashboard.

## Apps
- `apps/web` — Next.js 14 dashboard + landing page
- `apps/extension` — Plasmo browser extension (Chrome/Firefox/Edge)
- `apps/desktop` — Tauri v2 desktop app (Win/Mac/Linux)

## Packages
- `packages/convex` — Convex backend (schema, queries, actions)
- `packages/ui` — Shared React components
- `packages/core` — Shared types + system prompts

## Dev Setup

1. Clone repo
2. `npm install`
3. Copy `.env.example` to `apps/web/.env.local` and fill in keys
4. `cd packages/convex && npx convex dev`
5. `npm run dev` (runs all apps in parallel)

## Build

```bash
npm run build              # all apps
cd apps/extension && npm run build:all   # Chrome + Firefox + Edge
cd apps/desktop && npm run tauri build   # Win/Mac/Linux installer
```
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: add README, .gitignore, .env.example"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Compress, Enhance, Rewrite, Tone, Q&A, Template modes → Task 1 (system prompts), Task 3 (optimize action), Task 6 (dashboard UI)
- ✅ Multi-model targeting → Task 1 (MODEL_HINTS in prompts.ts), Task 3 (targetModel param)
- ✅ Prompt History + Versioning → Task 2 (prompts table), Task 6 (history page)
- ✅ Template Library → Task 2 (templates table), Task 6 (library page)
- ✅ Team Workspace → Task 2 (workspaces table, workspaceMembers)
- ✅ Developer API → Task 3 (http.ts endpoint + optimizeViaApi), Task 6 (settings page API key)
- ✅ Browser extension → Tasks 7, 8, 9
- ✅ Desktop app → Tasks 10, 11
- ✅ Billing → Task 12
- ✅ Auth (Clerk) → Task 4
- ✅ Plan limits enforcement → Task 2 (checkAndIncrementUsage), Task 2 (template limit check)
- ✅ Usage analytics → Task 2 (usageLogs), Task 6 (stats cards on dashboard)

**Placeholder scan:** No TBDs. Stripe price IDs marked as `price_pro_monthly_id` — replace with real IDs from Stripe dashboard before launch.

**Type consistency:** `Mode`, `TargetModel`, `Plan`, `Source` defined once in `packages/core/src/types.ts`, imported everywhere. `optimizePrompt` action args match content script message shape. `api.optimize.optimizePrompt` called with same params in popup, content script, and dashboard.
