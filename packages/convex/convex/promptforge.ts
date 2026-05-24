"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildIntentExtractionPrompt,
  buildSynthesisPrompt,
  buildReversePrompt,
  defaultTargetForModality,
  STYLE_GUIDES,
  MODELS,
  type Intent,
  type ModelId,
} from "@promptforge/core";

// ----- providers (lazy) -----

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set on Convex deployment");
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic | null {
  if (_anthropic) return _anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  _anthropic = new Anthropic({ apiKey });
  return _anthropic;
}

function getGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY ?? null;
}

let _gemini: GoogleGenerativeAI | null = null;
function getGemini(): GoogleGenerativeAI | null {
  if (_gemini) return _gemini;
  const key = getGeminiKey();
  if (!key) return null;
  _gemini = new GoogleGenerativeAI(key);
  return _gemini;
}

// ----- helpers -----

function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Extract intent JSON from a plain-English input. Uses GPT-4o-mini for
 * speed and cost — the structured output is consumed by all downstream
 * synthesis calls.
 */
async function extractIntent(input: string): Promise<Intent> {
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: buildIntentExtractionPrompt() },
      { role: "user", content: input },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });
  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error("Intent extraction returned empty response");
  try {
    const parsed = JSON.parse(content) as Intent;
    // Defensive: ensure required arrays exist
    if (!Array.isArray(parsed.constraints)) parsed.constraints = [];
    if (!parsed.modality) parsed.modality = "text";
    return parsed;
  } catch {
    throw new Error("Intent extraction returned non-JSON response");
  }
}

/**
 * Synthesize an optimized prompt for a specific target model from an Intent.
 * Routes to the right LLM provider when available; falls back to OpenAI.
 */
async function synthesizePrompt(
  target: ModelId,
  intent: Intent
): Promise<string> {
  const meta = MODELS[target];
  const sys = buildSynthesisPrompt(target);
  const user = `Intent JSON:\n\`\`\`json\n${JSON.stringify(intent, null, 2)}\n\`\`\`\n\nProduce the optimized prompt now.`;

  // Use the provider that owns the target model when we have keys for it.
  // For Anthropic targets, ask Claude itself to write its own prompt — it
  // knows its own format best.
  if (
    (target === "claude-sonnet-4.5" || target === "claude-opus-4.1") &&
    getAnthropic()
  ) {
    const claude = getAnthropic()!;
    const model =
      target === "claude-opus-4.1"
        ? "claude-opus-4-1-20250805"
        : "claude-sonnet-4-5-20250514";
    const res = await claude.messages.create({
      model,
      max_tokens: 1500,
      system: sys,
      messages: [{ role: "user", content: user }],
    });
    const block = res.content[0];
    if (block && block.type === "text") return block.text.trim();
    throw new Error("Anthropic returned no text content");
  }

  // For Gemini targets, ask Gemini itself.
  if (
    (target === "gemini-2.5-pro" || target === "gemini-2.5-flash") &&
    getGemini()
  ) {
    const gemini = getGemini()!;
    const modelName =
      target === "gemini-2.5-pro" ? "gemini-2.5-pro" : "gemini-2.5-flash";
    const model = gemini.getGenerativeModel({
      model: modelName,
      systemInstruction: sys,
    });
    const res = await model.generateContent(user);
    const text = res.response.text();
    if (!text) throw new Error("Gemini returned no text content");
    return text.trim();
  }

  // Default route: OpenAI for everything else.
  const openaiModel =
    target === "gpt-4o" || target === "gpt-4o-mini" ? target : "gpt-4o-mini";
  const res = await getOpenAI().chat.completions.create({
    model: openaiModel,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: target.startsWith("midjourney") ? 0.4 : 0.3,
    max_tokens: 1500,
  });
  const out = res.choices[0]?.message?.content;
  if (!out) throw new Error(`Synthesis returned empty for ${meta.label}`);
  return out.trim();
}

// ----- public actions -----

export const translate = action({
  args: {
    input: v.string(),
    target: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    if (!args.input || args.input.trim().length < 3) {
      throw new Error("Input is too short");
    }
    if (args.input.length > 8000) {
      throw new Error("Input exceeds 8000 characters");
    }

    // Quota gate
    await ctx.runMutation(internal.users.checkAndIncrementUsage, {
      clerkId: identity.subject,
    });

    const intent = await extractIntent(args.input);
    const target =
      (args.target as ModelId | undefined) ??
      defaultTargetForModality(intent.modality);
    const optimized = await synthesizePrompt(target, intent);

    const tokensIn = approxTokens(args.input);
    const tokensOut = approxTokens(optimized);

    await ctx.runMutation(internal.promptforge_mutations.savePromptForge, {
      clerkId: identity.subject,
      input: args.input,
      target,
      modality: intent.modality,
      intentJson: JSON.stringify(intent),
      optimized,
      tokensIn,
      tokensOut,
    });

    return { intent, target, optimized, tokensIn, tokensOut };
  },
});

export const showdown = action({
  args: {
    input: v.string(),
    targets: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    if (args.targets.length === 0) throw new Error("Pick at least one target");
    if (args.targets.length > 6) throw new Error("Maximum 6 targets per showdown");

    // Showdown counts as one quota unit (intent extraction is the dominant cost)
    await ctx.runMutation(internal.users.checkAndIncrementUsage, {
      clerkId: identity.subject,
    });

    const intent = await extractIntent(args.input);

    // Run all targets in parallel
    const results = await Promise.allSettled(
      args.targets.map(async (t) => {
        const target = t as ModelId;
        if (!STYLE_GUIDES[target]) throw new Error(`Unknown target: ${t}`);
        const optimized = await synthesizePrompt(target, intent);
        return { target, optimized };
      })
    );

    const outputs = results.map((r, i) => ({
      target: args.targets[i] as ModelId,
      optimized: r.status === "fulfilled" ? r.value.optimized : "",
      error: r.status === "rejected" ? String(r.reason?.message ?? r.reason) : null,
    }));

    return { intent, outputs };
  },
});

export const reverse = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    if (!args.prompt || args.prompt.length < 10) {
      throw new Error("Prompt is too short to reverse");
    }
    if (args.prompt.length > 16000) {
      throw new Error("Prompt exceeds 16000 characters");
    }

    await ctx.runMutation(internal.users.checkAndIncrementUsage, {
      clerkId: identity.subject,
    });

    const res = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildReversePrompt() },
        { role: "user", content: args.prompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });
    const explanation = res.choices[0]?.message?.content?.trim() ?? "";
    return { explanation };
  },
});

/**
 * Submit a thumbs up/down rating on a forge run.
 */
export const rateRun = action({
  args: {
    runId: v.id("forgeRuns"),
    rating: v.union(v.literal("up"), v.literal("down")),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    await ctx.runMutation(internal.promptforge_mutations.recordRating, {
      runId: args.runId,
      clerkId: identity.subject,
      rating: args.rating,
      comment: args.comment,
    });
  },
});
