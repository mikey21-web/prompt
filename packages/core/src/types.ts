export type Mode =
  | "compress"
  | "enhance"
  | "rewrite"
  | "tone"
  | "qa"
  | "template";

export type TargetModel =
  | "gpt-4o-mini"
  | "gpt-4o";

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
  tokens: { input: number; output: number };
  originalTokens?: number;
}

export const PLAN_LIMITS: Record<Plan, { requestsPerDay: number }> = {
  free: { requestsPerDay: 50 },
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
  "gpt-4o-mini",
  "gpt-4o",
];

export const ALL_TONES: Tone[] = [
  "formal",
  "casual",
  "technical",
  "creative",
  "persuasive",
];
