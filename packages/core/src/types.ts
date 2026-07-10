export type Mode =
  | "auto"
  | "compress"
  | "enhance"
  | "rewrite"
  | "tone"
  | "qa"
  | "template";

export type TargetModel =
  | "auto"
  | "gpt-4o-mini"
  | "gpt-4o";

export type Tone =
  | "formal"
  | "casual"
  | "technical"
  | "creative"
  | "persuasive";

export type Plan = "free" | "pro" | "team";

export type Strategy = "compress" | "enhance";

export interface Diagnosis {
  strategy: Strategy;
  reason: string;
}

export type ForgeMode = "auto" | Strategy;

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
  free: { requestsPerDay: 10000 },
  pro: { requestsPerDay: 10000 },
  team: { requestsPerDay: 10000 },
};

export const ALL_MODES: Mode[] = [
  "auto",
  "compress",
  "enhance",
  "rewrite",
  "tone",
  "qa",
  "template",
];

export const ALL_TARGET_MODELS: TargetModel[] = [
  "auto",
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
