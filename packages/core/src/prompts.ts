import type { Mode, TargetModel, Tone } from "./types";

const MODEL_HINTS: Record<TargetModel, string> = {
  gpt4o:
    "Format for GPT-4o: use markdown headers and bullet points for structure.",
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

export function countTokensApprox(text: string): number {
  // ~4 chars per token rough approximation (matches OpenAI's general guidance)
  return Math.ceil(text.length / 4);
}
