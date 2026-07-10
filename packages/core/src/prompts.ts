import type { Mode, TargetModel, Tone } from "./types";
import { countTokens } from "./token-count";

const MODEL_HINTS: Partial<Record<TargetModel, string>> = {
  "auto": "",
  "gpt-4o-mini":
    "Format for GPT-4o Mini: use clear, concise markdown formatting with bullet points.",
  "gpt-4o":
    "Format for GPT-4o: use detailed markdown headers and structured sections.",
};

export function buildSystemPrompt(
  mode: Mode,
  targetModel: TargetModel,
  tone?: Tone
): string {
  const modelHint = MODEL_HINTS[targetModel];

  const modeInstructions: Record<Mode, string> = {
    auto: `You are a senior prompt engineer. Decide whether this prompt needs compression (already clear, trim filler) or enhancement (vague, needs role/task/output-format/constraints), then apply it. Return ONLY the optimized prompt — no explanation, no preamble.`,

    compress: `You are a prompt compression expert. Remove filler words, hedging language ("I think", "maybe", "please"), redundancy, and unnecessary context while preserving 100% of the original intent. Return ONLY the compressed prompt — no explanation, no preamble. Target 30-55% token reduction.`,

    enhance: `You are a prompt engineering expert. Restructure the prompt to include: a role definition, clear task description, output format specification, and relevant constraints. Return ONLY the enhanced prompt — no explanation, no preamble.`,

    rewrite: `You are a prompt clarity expert. Rewrite the prompt to be precise, unambiguous, and direct. Remove vague language. Specify expected output format explicitly. Return ONLY the rewritten prompt — no explanation.`,

    tone: `You are a tone-adjustment expert. Rewrite the prompt in the specified tone: ${tone ?? "formal"}. Keep the original meaning. Return ONLY the tone-adjusted prompt — no explanation.`,

    qa: `You are a prompt engineering expert. The user will provide a prompt and answers to clarifying questions. Use their answers to build a precise, structured prompt. Return ONLY the final optimized prompt — no explanation.`,

    template: `You are a prompt template specialist. Fill in the template placeholders with contextually appropriate values based on the user's prompt. Return ONLY the completed prompt — no explanation.`,
  };

  return modelHint ? `${modeInstructions[mode]}\n\n${modelHint}` : modeInstructions[mode];
}

/** @deprecated Use `countTokens` from `@promptforge/core` instead. */
export function countTokensApprox(text: string, mode?: string): number {
  return countTokens(text, mode);
}
