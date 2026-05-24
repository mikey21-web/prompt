/**
 * PromptForge translation engine.
 *
 * Two stages:
 *   1. Intent extraction:  plain English -> structured Intent
 *   2. Format synthesis:   Intent + target model -> native-format prompt
 *
 * Both stages are LLM calls. The intent stage runs once per request; the
 * synthesis stage runs once per target model (so Showdown = N parallel
 * synthesis calls sharing one intent extraction).
 */

import { MODELS, type ModelId, type Modality } from "./models";
import { STYLE_GUIDES } from "./style-guides";

export interface Intent {
  modality: Modality;
  subject: string;
  action: string;
  context?: string;
  audience?: string;
  tone?: string;
  constraints: string[];
  output_format?: string;
  /** Optional shot-by-shot breakdown for video, or section breakdown for music. */
  structure?: string[];
  /** Optional explicit visual references (style, era, etc.) for image/video. */
  visual_refs?: string[];
}

/**
 * Build the system prompt for the intent extraction stage.
 *
 * The output is JSON conforming to the Intent interface. The model is told
 * to be terse and to never invent details the user didn't provide.
 */
export function buildIntentExtractionPrompt(): string {
  return `You are a prompt-engineering analyst. Your job is to convert plain-English user input into a structured Intent JSON object.

Rules:
- NEVER invent details the user did not provide. Mark unknowns with null or empty strings.
- Be terse. Each field should be a phrase, not a paragraph.
- Detect modality from the input. If user mentions "video", "shot", "scene" -> video. "image", "picture", "render" -> image. "song", "music", "lyrics" -> audio. Otherwise text.
- For ambiguous inputs default to text.

Output ONLY valid JSON matching this shape:
{
  "modality": "text" | "image" | "video" | "audio" | "code",
  "subject": string,
  "action": string,
  "context": string,
  "audience": string,
  "tone": string,
  "constraints": string[],
  "output_format": string,
  "structure": string[] | null,
  "visual_refs": string[] | null
}

Do not include any prose before or after the JSON.`;
}

/**
 * Build the system prompt for the format-synthesis stage.
 *
 * Embeds the target model's style guide so the synthesis call has
 * everything it needs. Few-shot examples come from the style guide.
 */
export function buildSynthesisPrompt(target: ModelId): string {
  const meta = MODELS[target];
  const guide = STYLE_GUIDES[target];

  const examplesBlock =
    guide.examples.length > 0
      ? `\n\nExamples:\n${guide.examples
          .map(
            (ex, i) =>
              `Example ${i + 1}\nInput intent (informal): "${ex.input}"\nOutput prompt:\n${ex.output}`
          )
          .join("\n\n")}`
      : "";

  return `You are a prompt-formatting expert for ${meta.label} (${meta.modality}).

Your task: convert the structured Intent JSON below into an optimized prompt in ${meta.label}'s native format.

Format specification:
${guide.format}

Hard rules:
${guide.rules.map((r) => `- ${r}`).join("\n")}

Anti-patterns (do NOT do these):
${guide.avoid.map((a) => `- ${a}`).join("\n")}${examplesBlock}

Output ONLY the optimized prompt. No preamble, no explanation, no quotes wrapping the output.`;
}

/**
 * Build the system prompt for the reverse-engineering stage.
 *
 * Used by /reverse: takes a complex prompt (any format) and returns the
 * plain-English intent that produced it. Useful for porting prompts
 * between models and for prompt-engineering education.
 */
export function buildReversePrompt(): string {
  return `You are a prompt analyst. Given a prompt written for any AI model, infer the user's plain-English intent.

Output structure:
1. Two-sentence summary of what the prompt is trying to accomplish.
2. Bulleted breakdown of:
   - Modality (text/image/video/audio/code)
   - Subject
   - Constraints (output format, tone, audience)
   - Detected target model (your best guess)
3. The "rewrite-friendly" plain-English version: 1-2 sentences that capture the same intent in casual language.

Be concise. Do not include the original prompt back. Do not add commentary about prompt quality.`;
}

/**
 * Default suggested target models per detected modality. Used when the
 * user hasn't picked a target explicitly.
 */
export function defaultTargetForModality(m: Modality): ModelId {
  switch (m) {
    case "image":
      return "midjourney-v7";
    case "video":
      return "sora-2";
    case "audio":
      return "suno-v4";
    case "code":
      return "claude-sonnet-4.5";
    case "text":
    default:
      return "claude-sonnet-4.5";
  }
}
