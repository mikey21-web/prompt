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

export const ALL_MODES: Mode[] = [
  "compress",
  "enhance",
  "rewrite",
  "tone",
  "qa",
  "template",
];

export const ALL_TARGET_MODELS: TargetModel[] = [
  "gpt4o",
  "claude",
  "gemini",
  "midjourney",
  "auto",
];

export const ALL_TONES: Tone[] = [
  "formal",
  "casual",
  "technical",
  "creative",
  "persuasive",
];
