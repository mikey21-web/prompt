/**
 * Per-model style guides. These are the rules the formatter consults when
 * translating an `Intent` into a model-specific prompt. Each guide is
 * carefully hand-tuned against the latest official guidance from each
 * provider. Update aggressively — models change every few weeks.
 *
 * Format philosophy:
 *   - `format` is a literal example/skeleton the formatter must follow
 *   - `rules` are hard constraints (must do)
 *   - `avoid` are anti-patterns the formatter should never produce
 *   - `examples` are 1-2 demonstrations to anchor quality
 */

import type { ModelId } from "./models";

export interface StyleGuide {
  id: ModelId;
  format: string;
  rules: string[];
  avoid: string[];
  examples: { input: string; output: string }[];
}

export const STYLE_GUIDES: Record<ModelId, StyleGuide> = {
  "claude-sonnet-4.5": {
    id: "claude-sonnet-4.5",
    format: `Use XML tags. Top-level structure:
<role>...</role>
<context>...</context>
<task>...</task>
<constraints>
  <constraint>...</constraint>
</constraints>
<output_format>...</output_format>
<examples>
  <example>...</example>
</examples>`,
    rules: [
      "Use XML tags for all structural elements — Claude is trained to attend to them.",
      "Put the most important instruction last (recency bias).",
      "Be explicit about output format — Claude follows it precisely.",
      "Include 1-2 few-shot examples when the task has a specific shape.",
      "Use direct, declarative sentences. No hedging.",
    ],
    avoid: [
      "Markdown headers (# ##) — XML tags are stronger.",
      "Vague phrases like 'high quality' or 'professional'.",
      "Long preambles before the task.",
      "Asking Claude to 'think step by step' without scaffolding — use <thinking> tags instead.",
    ],
    examples: [
      {
        input: "Write a blog post about remote work",
        output: `<role>You are a senior technical writer for a SaaS blog.</role>
<context>Target audience: engineering leaders who manage distributed teams of 10-50 people.</context>
<task>Write a 1200-word blog post on remote work practices.</task>
<constraints>
  <constraint>Open with a concrete anecdote, not a definition.</constraint>
  <constraint>Cite at least two specific tools or frameworks.</constraint>
  <constraint>End with three actionable next steps.</constraint>
</constraints>
<output_format>Markdown, with H2 sections and short paragraphs (max 4 sentences each).</output_format>`,
      },
    ],
  },

  "claude-opus-4.1": {
    id: "claude-opus-4.1",
    format: `Same XML structure as Sonnet, but lean into longer reasoning blocks:
<role>...</role>
<context>...</context>
<task>...</task>
<thinking>Explicit reasoning steps the model should consider</thinking>
<constraints>...</constraints>
<output_format>...</output_format>`,
    rules: [
      "Add a <thinking> block for complex tasks — Opus uses it well.",
      "Allow longer constraint lists (5-10) — Opus tracks them all.",
      "Use this for analysis, code review, long-form writing.",
    ],
    avoid: [
      "Wasting Opus on simple tasks — use Sonnet.",
      "Short prompts — Opus shines with rich context.",
    ],
    examples: [],
  },

  "gpt-4o": {
    id: "gpt-4o",
    format: `Use markdown sections with system + user separation:
# Role
You are ...

# Task
...

# Constraints
- ...
- ...

# Output Format
...

# Examples (optional)
Input: ...
Output: ...`,
    rules: [
      "Use markdown headers — GPT-4o prefers them.",
      "List constraints as bullets, not prose.",
      "Specify output schema when structure matters (JSON, table, etc.).",
      "Place few-shot examples after constraints, before the actual task.",
      "Use 'You are...' for role assignment.",
    ],
    avoid: [
      "XML tags — GPT-4o ignores them as decoration.",
      "Asking 'please' or hedging — direct imperatives work better.",
      "Mixing system and user voice in the same block.",
    ],
    examples: [
      {
        input: "Write a blog post about remote work",
        output: `# Role
You are a senior technical writer for a SaaS blog.

# Task
Write a 1200-word blog post on remote work practices for engineering leaders managing distributed teams of 10-50 people.

# Constraints
- Open with a concrete anecdote, not a definition.
- Cite at least two specific tools or frameworks.
- End with three actionable next steps.

# Output Format
Markdown with H2 sections and short paragraphs (max 4 sentences each).`,
      },
    ],
  },

  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    format: `Same as GPT-4o but tighter — Mini handles simpler tasks better when the prompt is concise:
# Task
...
# Constraints
- ...
# Output
...`,
    rules: [
      "Keep prompts under 500 tokens.",
      "Skip the role section unless persona matters.",
      "Use for classification, extraction, simple rewrites.",
    ],
    avoid: [
      "Long system prompts — Mini gets confused.",
      "Multi-step reasoning chains — use GPT-4o.",
    ],
    examples: [],
  },

  "gemini-2.5-pro": {
    id: "gemini-2.5-pro",
    format: `Use clear ## sections with explicit reasoning hooks:
## Goal
...

## Context
...

## Steps
1. ...
2. ...

## Output
Format: ...`,
    rules: [
      "Use numbered steps — Gemini follows ordered procedures well.",
      "Be explicit about reasoning — Gemini benefits from 'first, then, finally' scaffolding.",
      "For multimodal: use [IMAGE_1] tags to reference attached images.",
      "Long context (1M tokens) — paste full documents inline rather than summarizing.",
    ],
    avoid: [
      "Heavy XML tags — Gemini doesn't favor them.",
      "Vague 'be creative' instructions.",
    ],
    examples: [],
  },

  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    format: `Tight markdown, fast tasks:
## Task
...
## Output
...`,
    rules: [
      "Use for high-volume classification, extraction, summarization.",
      "Keep prompts under 200 tokens.",
    ],
    avoid: [
      "Complex multi-step reasoning — switch to Pro.",
    ],
    examples: [],
  },

  "midjourney-v7": {
    id: "midjourney-v7",
    format: `Comma-separated tokens followed by parameter flags:
[subject], [environment], [lighting], [composition], [style], [medium], [details] --ar [W:H] --style raw --v 7 --stylize [0-1000]`,
    rules: [
      "Order matters: subject → environment → lighting → composition → style → medium → details.",
      "Use specific style references: '35mm film', 'cinematic', 'oil painting'.",
      "Specify lighting: 'volumetric blue light', 'golden hour', 'rim light'.",
      "Use --ar 16:9 for cinematic, 1:1 for social, 9:16 for vertical.",
      "Add --style raw for less stylization, more photorealism.",
      "Add --stylize 250 for balanced, 750+ for artistic.",
      "Use weight syntax sparingly: ::2 to emphasize, ::-0.5 to suppress.",
    ],
    avoid: [
      "Sentences — only tokens.",
      "Negative prompts (Midjourney v7 doesn't support them — use --no flag instead).",
      "Generic descriptors: 'beautiful', 'amazing', 'high quality'.",
      "Conflicting style references in the same prompt.",
    ],
    examples: [
      {
        input: "a guy sees a cat and runs away, cinematic horror",
        output: `terrified man fleeing dark hallway, black cat with glowing yellow eyes, low angle shot, volumetric blue light, dust motes, 35mm film grain, cinematic horror, dolly zoom, atmospheric, shallow depth of field --ar 21:9 --style raw --v 7 --stylize 400`,
      },
    ],
  },

  "dalle-3": {
    id: "dalle-3",
    format: `Natural language prose, 1-3 sentences. Hierarchy: subject first, then setting, then style.`,
    rules: [
      "Use complete sentences — DALL·E parses prose, not tokens.",
      "Be specific about subject, action, setting, lighting, style.",
      "DALL·E 3 ignores negative prompts entirely.",
      "It rewrites your prompt internally — keep yours focused.",
      "For text in images, put the desired text in quotes.",
    ],
    avoid: [
      "Comma-separated token lists — DALL·E treats them as one sentence.",
      "Style modifiers like '4k, 8k, ultra realistic' — they don't help.",
      "Trying to suppress unwanted elements with 'no X' — DALL·E may add them.",
    ],
    examples: [
      {
        input: "a guy sees a cat and runs away, cinematic horror",
        output: `A wide cinematic shot of a terrified man in his thirties fleeing down a dim hallway, looking back over his shoulder. A motionless black cat sits in the foreground with glowing yellow eyes. Cold blue volumetric lighting cuts through dust in the air. Shot on 35mm film, shallow depth of field, horror movie atmosphere.`,
      },
    ],
  },

  "stable-diffusion-xl": {
    id: "stable-diffusion-xl",
    format: `Two sections — positive then negative:
POSITIVE: (subject:1.3), environment, (lighting:1.2), style, medium, details, quality_modifiers
NEGATIVE: blurry, low quality, deformed, ...`,
    rules: [
      "Use weight syntax: (token:1.2) to emphasize, (token:0.8) to de-emphasize.",
      "Include quality modifiers in positive: 'masterpiece, best quality, 8k, cinematic'.",
      "Always include a negative prompt with common defects.",
      "For SDXL specifically, prefer descriptive natural language over short tokens.",
    ],
    avoid: [
      "Weights above 1.5 — distorts output.",
      "Skipping the negative prompt — quality drops noticeably.",
    ],
    examples: [],
  },

  "sora-2": {
    id: "sora-2",
    format: `Shot-list format with explicit camera, action, lighting, and duration. Use prose paragraphs:
[OPENING SHOT — duration]
Camera: ...
Subject: ...
Action: ...
Lighting: ...
Mood: ...

[CUT TO — duration]
...`,
    rules: [
      "Specify camera language: 'dolly in', 'low angle', 'overhead', 'tracking shot'.",
      "Include exact lighting: 'cold blue volumetric', 'golden hour', 'practical sources'.",
      "Specify duration per shot in seconds.",
      "Sora handles transitions ('cut to', 'fade'), use them.",
      "Audio cues in brackets: [foley: footsteps], [score: rising strings].",
    ],
    avoid: [
      "Single-paragraph dumps — break into shots.",
      "Asking for specific actors or recognizable IP — Sora refuses.",
      "Vague durations like 'short' or 'long'.",
    ],
    examples: [
      {
        input: "a guy sees a cat and runs away, cinematic horror",
        output: `[OPENING SHOT — 3s]
Camera: Wide shot, slow dolly in.
Subject: Dimly lit hallway, dust motes drifting in cold blue light.
Action: A man, mid-30s, enters frame from the right, hesitant.
Lighting: Volumetric blue from an off-screen window.
Mood: Dread, anticipation.

[CUT TO — 2s]
Camera: Low angle, locked off.
Subject: A motionless black cat, eyes glowing yellow.
Mood: Stillness, threat.

[CUT TO — 3s]
Camera: Handheld, shaky, retreating.
Action: The man runs back the way he came, breathing hard.
[Foley: distant heartbeat, rising strings]
Mood: Panic.`,
      },
    ],
  },

  "runway-gen-3": {
    id: "runway-gen-3",
    format: `Single-paragraph cinematographic description with explicit camera moves:
[Camera move]. [Subject + environment]. [Action]. [Lighting + mood].`,
    rules: [
      "Lead with the camera move — Runway weights it heavily.",
      "Use one continuous shot per generation (Runway is shot-by-shot).",
      "Specify lens: '35mm anamorphic', 'wide angle', 'telephoto'.",
      "Limit prompts to 4-5 sentences max.",
    ],
    avoid: [
      "Multiple shots in one prompt — Runway gets confused.",
      "Time-based directions ('then', 'after that') — single moment only.",
    ],
    examples: [],
  },

  "veo-3": {
    id: "veo-3",
    format: `Same shot-list format as Sora. Veo handles synchronized audio natively, so include explicit dialogue and sound design:
[SHOT — duration]
Camera: ...
Action: ...
Dialogue: "..."
SFX: ...`,
    rules: [
      "Veo 3 generates synced audio + video. Always include dialogue and SFX cues.",
      "Specify dialogue tone: 'whispered', 'shouted', 'matter-of-fact'.",
      "Use SFX bracketing: [SFX: glass breaking].",
    ],
    avoid: [
      "Skipping audio direction — you lose Veo's main differentiator.",
    ],
    examples: [],
  },

  "suno-v4": {
    id: "suno-v4",
    format: `Two parts: (1) style descriptor, (2) lyrics with section tags:
Style: [genre, instruments, tempo, mood, era]

[Verse 1]
...
[Chorus]
...
[Bridge]
...
[Outro]`,
    rules: [
      "Section tags MUST be on their own lines: [Verse], [Chorus], [Bridge], [Outro], [Hook], [Pre-Chorus].",
      "Specify tempo (BPM) and key when known.",
      "Layer instruments: 'analog synth, drum machine, fingerpicked acoustic guitar'.",
      "Mood + era: 'wistful 1970s folk', 'aggressive 90s grunge'.",
    ],
    avoid: [
      "Inline section labels like '(verse)' — must be on own line in brackets.",
      "Mixing genres without intent ('jazz metal') unless that's the point.",
    ],
    examples: [],
  },

  elevenlabs: {
    id: "elevenlabs",
    format: `Plain text with bracketed direction. ElevenLabs uses prosody markers:
[whispered] ...
[laughs] ...
[pause]`,
    rules: [
      "Use bracketed direction sparingly: [whispered], [laughs], [pause], [sighs].",
      "For dialogue, write naturally — ElevenLabs reads punctuation as pacing.",
      "ALL CAPS for emphasis.",
    ],
    avoid: [
      "Stage directions outside brackets — they get read aloud.",
    ],
    examples: [],
  },
};
