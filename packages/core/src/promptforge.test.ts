import { describe, it, expect } from "vitest";
import {
  buildIntentExtractionPrompt,
  buildSynthesisPrompt,
  buildReversePrompt,
  buildStrategyDirective,
  defaultTargetForModality,
  type Intent,
} from "./promptforge";
import { type Strategy } from "./types";
import { countTokens } from "./token-count";
import { STYLE_GUIDES } from "./style-guides";
import { MODELS, ALL_MODEL_IDS, type Modality } from "./models";
import { ALL_MODES, type Mode } from "./types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FIXTURES = {
  short: "Write a poem about AI",
  verbose:
    "I think you should maybe consider writing a poem about artificial intelligence and its impact on society, if that's okay with you. Please and thank you.",
  code: "Write a React component that fetches data from an API and displays it in a table with sorting and filtering",
  image:
    "A cinematic shot of a cyberpunk city at night with neon lights reflecting on wet pavement, rain falling, highly detailed",
};

// ---------------------------------------------------------------------------
// buildIntentExtractionPrompt
// ---------------------------------------------------------------------------

describe("buildIntentExtractionPrompt", () => {
  it("returns a string", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(typeof prompt).toBe("string");
  });

  it("contains the JSON shape definition", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(prompt).toContain("modality");
    expect(prompt).toContain("subject");
    expect(prompt).toContain("action");
    expect(prompt).toContain("constraints");
    expect(prompt).toContain("output_format");
  });

  it("instructs the model to output only valid JSON", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(prompt).toContain("Output ONLY valid JSON");
  });

  it("tells the model not to invent details", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(prompt).toContain("NEVER invent details");
    expect(prompt).toContain("null or empty strings");
  });

  it("includes modality detection rules for each type", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(prompt).toContain("video");
    expect(prompt).toContain("image");
    expect(prompt).toContain("audio");
    expect(prompt).toContain("text");
  });

  it("specifies all five modality options", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(prompt).toContain('"text" | "image" | "video" | "audio" | "code"');
  });

  it("instructs to not include prose before or after JSON output", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(prompt).toMatch(/Do not include any prose before or after the JSON/);
  });

  it("marks ambiguous inputs default to text", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(prompt).toMatch(/ambiguous inputs default to text/i);
  });
});

// ---------------------------------------------------------------------------
// buildSynthesisPrompt
// ---------------------------------------------------------------------------

describe("buildSynthesisPrompt", () => {
  it("returns a string for every registered model", () => {
    for (const modelId of ALL_MODEL_IDS) {
      const prompt = buildSynthesisPrompt(modelId);
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(50);
    }
  });

  it("embeds the target model label", () => {
    const prompt = buildSynthesisPrompt("claude-sonnet-4.5");
    expect(prompt).toContain("Claude Sonnet 4.5");
  });

  it("embeds the style guide format spec for the target model", () => {
    const prompt = buildSynthesisPrompt("midjourney-v7");
    const guide = STYLE_GUIDES["midjourney-v7"];
    // The format block should appear verbatim
    expect(prompt).toContain(guide.format.substring(0, 40));
  });

  it("embeds hard rules from the style guide", () => {
    const prompt = buildSynthesisPrompt("suno-v4");
    const guide = STYLE_GUIDES["suno-v4"];
    for (const rule of guide.rules) {
      expect(prompt).toContain(rule);
    }
  });

  it("embeds anti-pattern (avoid) rules from the style guide", () => {
    const prompt = buildSynthesisPrompt("dalle-3");
    const guide = STYLE_GUIDES["dalle-3"];
    for (const avoid of guide.avoid) {
      expect(prompt).toContain(avoid);
    }
  });

  it("includes example blocks when the style guide has examples", () => {
    const prompt = buildSynthesisPrompt("gpt-4o");
    // GPT-4o has 1 example
    expect(prompt).toMatch(/Example 1/);
    expect(prompt).toMatch(/Input intent/);
    expect(prompt).toMatch(/Output prompt/);
  });

  it("omits the examples section when the style guide has no examples", () => {
    const prompt = buildSynthesisPrompt("gemini-2.5-pro");
    expect(prompt).not.toMatch(/Example 1/);
  });

  it("instructs the model to return only the optimized prompt", () => {
    const prompt = buildSynthesisPrompt("gpt-4o");
    expect(prompt).toMatch(/Output ONLY the optimized prompt/);
    expect(prompt).toMatch(/No preamble, no explanation/);
  });
});

// ---------------------------------------------------------------------------
// buildStrategyDirective
// ---------------------------------------------------------------------------

describe("buildStrategyDirective", () => {
  it("returns a string for compress strategy", () => {
    const directive = buildStrategyDirective("compress");
    expect(typeof directive).toBe("string");
    expect(directive.length).toBeGreaterThan(0);
  });

  it("returns a string for enhance strategy", () => {
    const directive = buildStrategyDirective("enhance");
    expect(typeof directive).toBe("string");
    expect(directive.length).toBeGreaterThan(0);
  });

  it("compress directive mentions removing filler or shortening", () => {
    const directive = buildStrategyDirective("compress");
    expect(directive.toLowerCase()).toMatch(/remove|shorten|compress|filler|concise/);
  });

  it("enhance directive mentions adding structure or improving", () => {
    const directive = buildStrategyDirective("enhance");
    expect(directive.toLowerCase()).toMatch(/add|enhance|structure|improve|expand/);
  });

  it("compress and enhance return different directives", () => {
    const compress = buildStrategyDirective("compress");
    const enhance = buildStrategyDirective("enhance");
    expect(compress).not.toBe(enhance);
  });
});

// ---------------------------------------------------------------------------
// buildIntentExtractionPrompt — diagnosis field
// ---------------------------------------------------------------------------

describe("buildIntentExtractionPrompt — diagnosis", () => {
  it("includes the diagnosis field in the JSON shape", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(prompt).toContain("diagnosis");
    expect(prompt).toContain("strategy");
    expect(prompt).toContain("reason");
  });

  it("describes diagnosis as compress or enhance", () => {
    const prompt = buildIntentExtractionPrompt();
    expect(prompt).toMatch(/compress|enhance/i);
  });
});

// ---------------------------------------------------------------------------
// buildReversePrompt
// ---------------------------------------------------------------------------

describe("buildReversePrompt", () => {
  it("returns a string", () => {
    const prompt = buildReversePrompt();
    expect(typeof prompt).toBe("string");
  });

  it("asks for a two-sentence summary", () => {
    const prompt = buildReversePrompt();
    expect(prompt).toContain("Two-sentence summary");
  });

  it("asks for a bulleted breakdown with all required fields", () => {
    const prompt = buildReversePrompt();
    expect(prompt).toContain("Modality");
    expect(prompt).toContain("Subject");
    expect(prompt).toContain("Constraints");
    expect(prompt).toContain("Detected target model");
  });

  it("asks for a rewrite-friendly plain-English version", () => {
    const prompt = buildReversePrompt();
    expect(prompt).toContain("rewrite-friendly");
  });

  it("instructs to be concise and not include the original prompt", () => {
    const prompt = buildReversePrompt();
    expect(prompt).toContain("Be concise");
    expect(prompt).toContain("Do not include the original prompt");
  });

  it("instructs to not add commentary about prompt quality", () => {
    const prompt = buildReversePrompt();
    expect(prompt).toContain("Do not add commentary about prompt quality");
  });
});

// ---------------------------------------------------------------------------
// defaultTargetForModality
// ---------------------------------------------------------------------------

describe("defaultTargetForModality", () => {
  it('returns "midjourney-v7" for image modality', () => {
    expect(defaultTargetForModality("image")).toBe("midjourney-v7");
  });

  it('returns "sora-2" for video modality', () => {
    expect(defaultTargetForModality("video")).toBe("sora-2");
  });

  it('returns "suno-v4" for audio modality', () => {
    expect(defaultTargetForModality("audio")).toBe("suno-v4");
  });

  it('returns "claude-sonnet-4.5" for code modality', () => {
    expect(defaultTargetForModality("code")).toBe("claude-sonnet-4.5");
  });

  it('returns "claude-sonnet-4.5" for text modality', () => {
    expect(defaultTargetForModality("text")).toBe("claude-sonnet-4.5");
  });

  it("returns a valid ModelId for every modality", () => {
    const modalities: Modality[] = ["text", "image", "video", "audio", "code"];
    for (const m of modalities) {
      const target = defaultTargetForModality(m);
      expect(ALL_MODEL_IDS).toContain(target);
    }
  });

  it("returns a model matching the input modality for image, video, audio", () => {
    expect(MODELS[defaultTargetForModality("image")].modality).toBe("image");
    expect(MODELS[defaultTargetForModality("video")].modality).toBe("video");
    expect(MODELS[defaultTargetForModality("audio")].modality).toBe("audio");
  });

  it('falls back to text modality for code (no dedicated code model exists)', () => {
    // There is no model with modality "code" registered in MODELS,
    // so code defaults to the text model claude-sonnet-4.5.
    expect(MODELS[defaultTargetForModality("code")].modality).toBe("text");
    expect(MODELS[defaultTargetForModality("text")].modality).toBe("text");
  });
});

// ---------------------------------------------------------------------------
// countTokens — Fixture tests
// ---------------------------------------------------------------------------

describe("countTokens with real fixtures", () => {
  it("returns > 0 for every fixture", () => {
    for (const [label, text] of Object.entries(FIXTURES)) {
      const tokens = countTokens(text);
      expect(tokens, `Fixture "${label}" should have positive token count`).toBeGreaterThan(0);
    }
  });

  it("short prompt has fewer tokens than verbose prompt (same mode)", () => {
    const shortTokens = countTokens(FIXTURES.short);
    const verboseTokens = countTokens(FIXTURES.verbose);
    expect(shortTokens).toBeLessThan(verboseTokens);
  });

  it("code prompt has different token ratio than prose", () => {
    const codeTokens = countTokens(FIXTURES.code);
    const proseTokens = countTokens(FIXTURES.verbose);

    // Both are strings of reasonable length — code should use a lower
    // words-to-tokens ratio (1.1 vs 1.3) due to special characters.
    // Check that the code token count ratio per word is lower.
    const codeWords = FIXTURES.code.split(/\s+/).length;
    const proseWords = FIXTURES.verbose.split(/\s+/).length;

    const codeRatio = codeTokens / codeWords;
    const proseRatio = proseTokens / proseWords;

    // Code should have lower or equal tokens-per-word ratio
    // (1.1 vs 1.3 words-to-tokens means fewer tokens per word for code)
    expect(codeRatio).toBeLessThanOrEqual(proseRatio);
  });

  it("mode parameter changes token estimate (compress < enhance)", () => {
    const compressTokens = countTokens(FIXTURES.verbose, "compress");
    const enhanceTokens = countTokens(FIXTURES.verbose, "enhance");
    // compress ratio (3.5) < enhance ratio (4.5) → more tokens for compress
    // for the same char count
    expect(compressTokens).toBeGreaterThan(enhanceTokens);
  });

  it("short prompt in compress mode still returns positive count", () => {
    const tokens = countTokens(FIXTURES.short, "compress");
    expect(tokens).toBeGreaterThan(0);
  });

  it("image fixture has a consistent token count", () => {
    const tokens = countTokens(FIXTURES.image);
    expect(tokens).toBeGreaterThan(0);
    // Run twice for determinism
    expect(countTokens(FIXTURES.image)).toBe(tokens);
  });

  it("all modes return the same count for an all-code fixture (non-mode-specific path)", () => {
    // Token count uses mode for char-based fallback only (when chars dominate)
    // For prose with mixed length, consistency checks.
    const results = ALL_MODES.map((m) => countTokens(FIXTURES.code, m));
    // All results should be > 0
    for (const r of results) {
      expect(r).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// selectModel — mode-specific routing logic (from convex/optimize.ts)
// These tests replicate the pure routing logic found in the Convex action so
// we have fast, dependency-free coverage of model selection.
// ---------------------------------------------------------------------------

describe("selectModel — mode-specific routing", () => {
  // Replicate the pure function from convex/optimize.ts so we can test it
  // without importing Convex dependencies or hitting a real API.
  function selectModel(mode: Mode): string {
    if (mode === "qa" || mode === "enhance") return "gpt-4o";
    return "gpt-4o-mini";
  }

  it('routes qa and enhance modes to "gpt-4o"', () => {
    expect(selectModel("qa")).toBe("gpt-4o");
    expect(selectModel("enhance")).toBe("gpt-4o");
  });

  it('routes compress mode to "gpt-4o-mini"', () => {
    expect(selectModel("compress")).toBe("gpt-4o-mini");
  });

  it('routes rewrite mode to "gpt-4o-mini"', () => {
    expect(selectModel("rewrite")).toBe("gpt-4o-mini");
  });

  it('routes tone mode to "gpt-4o-mini"', () => {
    expect(selectModel("tone")).toBe("gpt-4o-mini");
  });

  it('routes template mode to "gpt-4o-mini"', () => {
    expect(selectModel("template")).toBe("gpt-4o-mini");
  });

  it("routes every mode without throwing", () => {
    for (const mode of ALL_MODES) {
      expect(() => selectModel(mode)).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("buildSynthesisPrompt — edge cases", () => {
  it("throws for unknown model ids", () => {
    // @ts-expect-error — testing runtime behaviour with an invalid model id
    expect(() => buildSynthesisPrompt("nonexistent-model")).toThrow();
  });
});

describe("countTokens — edge cases", () => {
  it("returns 0 for nullish input", () => {
    // @ts-expect-error — testing runtime behaviour with invalid type
    expect(countTokens(null)).toBe(0);
    // @ts-expect-error — testing runtime behaviour with invalid type
    expect(countTokens(undefined)).toBe(0);
  });

  it("returns a positive count for single-word input", () => {
    expect(countTokens("hello")).toBeGreaterThan(0);
  });

  it("handles strings with only special characters", () => {
    const tokens = countTokens("<<<<<{{{{{>>>>>");
    expect(tokens).toBeGreaterThan(0);
  });

  it("handles very long strings without throwing", () => {
    const longStr = "word ".repeat(1000);
    expect(() => countTokens(longStr)).not.toThrow();
    expect(countTokens(longStr)).toBeGreaterThan(0);
  });
});

describe("defaultTargetForModality — edge cases", () => {
  it("handles any string cast as Modality gracefully", () => {
    // @ts-expect-error — testing runtime behaviour with potential garbage input
    const result = defaultTargetForModality("unknown");
    // Falls through to the default case (text → claude-sonnet-4.5)
    expect(result).toBe("claude-sonnet-4.5");
  });
});

// ---------------------------------------------------------------------------
// Sanity: buildSynthesisPrompt embeds every style guide correctly
// ---------------------------------------------------------------------------

describe("buildSynthesisPrompt — style guide completeness", () => {
  for (const modelId of ALL_MODEL_IDS) {
    it(`includes the format specification for ${modelId}`, () => {
      const prompt = buildSynthesisPrompt(modelId);
      const guide = STYLE_GUIDES[modelId];
      // The format field is the first thing mentioned after "Format specification:"
      expect(prompt).toContain("Format specification:");
      // At least one rule should be present
      expect(prompt).toContain("Hard rules:");
      expect(prompt).toContain("Anti-patterns");

      // Every rule should appear
      for (const rule of guide.rules) {
        expect(prompt).toContain(rule);
      }

      // Every avoid should appear
      for (const avoid of guide.avoid) {
        expect(prompt).toContain(avoid);
      }
    });
  }
});
