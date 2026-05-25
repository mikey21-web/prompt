import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import {
  buildSystemPrompt,
  countTokensApprox,
  type Mode,
  type TargetModel,
  type Tone,
} from "@promptforge/core";

// Lazy-initialize OpenAI so module load doesn't fail when OPENAI_API_KEY is
// missing (e.g. during the very first `convex push` before secrets are set).
// Each action invocation reads the env var fresh, which also lets you rotate
// the key without redeploying.
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured on this Convex deployment. " +
          "Run: npx convex env set OPENAI_API_KEY <key>"
      );
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

function selectModel(mode: Mode): string {
  if (mode === "qa" || mode === "enhance") return "gpt-4o";
  return "gpt-4o-mini";
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
  handler: async (ctx, args): Promise<{
    optimized: string;
    tokensIn: number;
    tokensOut: number;
    savedTokens: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Check + increment limits atomically
    await ctx.runMutation(internal.users.checkAndIncrementUsage, {
      clerkId: identity.subject,
    });

    const systemPrompt = buildSystemPrompt(
      args.mode as Mode,
      args.targetModel as TargetModel,
      args.tone as Tone | undefined
    );
    const model = selectModel(args.mode as Mode);

    const userMessage =
      args.mode === "qa"
        ? `Here is my prompt: "${args.prompt}"\n\nAsk me 3 clarifying questions to better understand my needs. Number them 1-3.`
        : args.prompt;

    const response = await getOpenAI().chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const optimized = response.choices[0].message.content ?? "";
    const tokensIn = countTokensApprox(args.prompt);
    const tokensOut = countTokensApprox(optimized);
    const savedTokens = Math.max(0, tokensIn - tokensOut);

    await ctx.runMutation(internal.optimize.savePromptAndLog, {
      clerkId: identity.subject,
      original: args.prompt,
      optimized,
      mode: args.mode,
      targetModel: args.targetModel,
      tokensIn,
      tokensOut,
      savedTokens,
      source: args.source,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mode: args.mode as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      targetModel: args.targetModel as any,
      tokensIn: args.tokensIn,
      tokensOut: args.tokensOut,
      savedTokens: args.savedTokens,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const optimizeViaApi = action({
  args: {
    apiKey: v.string(),
    prompt: v.string(),
    mode: v.string(),
    targetModel: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { apiKey, prompt, mode, targetModel = "auto" }
  ): Promise<{
    optimized: string;
    tokensIn: number;
    tokensOut: number;
    savedTokens: number;
  }> => {
    const user = await ctx.runMutation(internal.users.getUserByApiKey, {
      apiKey,
    });
    if (!user) throw new Error("Invalid API key");
    // API access free for everyone

    // Increment usage (no auth identity available — pass clerkId directly)
    await ctx.runMutation(internal.users.checkAndIncrementUsage, {
      clerkId: user.clerkId,
    });

    const systemPrompt = buildSystemPrompt(
      mode as Mode,
      targetModel as TargetModel
    );
    const model = selectModel(mode as Mode);

    const response = await getOpenAI().chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const optimized = response.choices[0].message.content ?? "";
    const tokensIn = countTokensApprox(prompt);
    const tokensOut = countTokensApprox(optimized);
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
