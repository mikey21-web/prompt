/**
 * Target model registry. Each entry is a flagship target the optimizer
 * supports. The `format` field drives prompt construction (which is
 * implemented in promptforge.ts).
 *
 * To add a model: add it here, add a style guide entry in `style-guides.ts`,
 * and (optionally) add a provider in `apps/web/lib/llm/`.
 */

export type Modality = "text" | "image" | "video" | "audio" | "code";

export type ModelId =
  // text
  | "claude-sonnet-4.5"
  | "claude-opus-4.1"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  // image
  | "midjourney-v7"
  | "dalle-3"
  | "stable-diffusion-xl"
  // video
  | "sora-2"
  | "runway-gen-3"
  | "veo-3"
  // audio
  | "suno-v4"
  | "elevenlabs";

export interface ModelMeta {
  id: ModelId;
  label: string;
  provider:
    | "anthropic"
    | "openai"
    | "google"
    | "midjourney"
    | "stability"
    | "runway"
    | "suno"
    | "elevenlabs";
  modality: Modality;
  format:
    | "claude-xml"
    | "openai-markdown"
    | "gemini-structured"
    | "midjourney-tokens"
    | "dalle-prose"
    | "sd-tokens"
    | "video-shotlist"
    | "music-structured";
  /** Whether we currently have an API key wired to actually call this model. */
  callable: boolean;
  /** UI hint: short tagline shown next to the model name. */
  blurb: string;
}

export const MODELS: Record<ModelId, ModelMeta> = {
  "claude-sonnet-4.5": {
    id: "claude-sonnet-4.5",
    label: "Claude Sonnet 4.5",
    provider: "anthropic",
    modality: "text",
    format: "claude-xml",
    callable: true,
    blurb: "Best for nuanced text + reasoning",
  },
  "claude-opus-4.1": {
    id: "claude-opus-4.1",
    label: "Claude Opus 4.1",
    provider: "anthropic",
    modality: "text",
    format: "claude-xml",
    callable: true,
    blurb: "Highest quality, slow",
  },
  "gpt-4o": {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    modality: "text",
    format: "openai-markdown",
    callable: true,
    blurb: "Balanced quality + speed",
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    provider: "openai",
    modality: "text",
    format: "openai-markdown",
    callable: true,
    blurb: "Fast, cheap, capable",
  },
  "gemini-2.5-pro": {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    provider: "google",
    modality: "text",
    format: "gemini-structured",
    callable: true,
    blurb: "Multimodal, long context",
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "google",
    modality: "text",
    format: "gemini-structured",
    callable: true,
    blurb: "Fast multimodal",
  },
  "midjourney-v7": {
    id: "midjourney-v7",
    label: "Midjourney v7",
    provider: "midjourney",
    modality: "image",
    format: "midjourney-tokens",
    callable: false,
    blurb: "Comma-separated tokens + flags",
  },
  "dalle-3": {
    id: "dalle-3",
    label: "DALL·E 3",
    provider: "openai",
    modality: "image",
    format: "dalle-prose",
    callable: true,
    blurb: "Natural language prose",
  },
  "stable-diffusion-xl": {
    id: "stable-diffusion-xl",
    label: "Stable Diffusion XL",
    provider: "stability",
    modality: "image",
    format: "sd-tokens",
    callable: false,
    blurb: "Weighted tokens + negatives",
  },
  "sora-2": {
    id: "sora-2",
    label: "Sora 2",
    provider: "openai",
    modality: "video",
    format: "video-shotlist",
    callable: false,
    blurb: "Cinematic shot lists",
  },
  "runway-gen-3": {
    id: "runway-gen-3",
    label: "Runway Gen-3",
    provider: "runway",
    modality: "video",
    format: "video-shotlist",
    callable: false,
    blurb: "Camera + motion-aware",
  },
  "veo-3": {
    id: "veo-3",
    label: "Veo 3",
    provider: "google",
    modality: "video",
    format: "video-shotlist",
    callable: false,
    blurb: "Google's flagship video model",
  },
  "suno-v4": {
    id: "suno-v4",
    label: "Suno v4",
    provider: "suno",
    modality: "audio",
    format: "music-structured",
    callable: false,
    blurb: "Music with section tags",
  },
  elevenlabs: {
    id: "elevenlabs",
    label: "ElevenLabs",
    provider: "elevenlabs",
    modality: "audio",
    format: "music-structured",
    callable: false,
    blurb: "Voice synthesis",
  },
};

export const ALL_MODEL_IDS = Object.keys(MODELS) as ModelId[];

export const MODELS_BY_MODALITY: Record<Modality, ModelMeta[]> = {
  text: [],
  image: [],
  video: [],
  audio: [],
  code: [],
};
for (const m of Object.values(MODELS)) {
  MODELS_BY_MODALITY[m.modality].push(m);
}

/** The four flagship text models used by the Showdown view. */
export const SHOWDOWN_MODELS: ModelId[] = [
  "claude-sonnet-4.5",
  "gpt-4o",
  "gemini-2.5-pro",
  "midjourney-v7",
];
