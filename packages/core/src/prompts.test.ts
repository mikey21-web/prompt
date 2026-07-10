import { describe, it, expect } from "vitest";
import { buildSystemPrompt, countTokensApprox } from "./prompts";
import { countTokens } from "./token-count";
import { PLAN_LIMITS, ALL_MODES } from "./types";

describe("buildSystemPrompt", () => {
  it("compress mode includes token reduction target", () => {
    const prompt = buildSystemPrompt("compress", "auto");
    expect(prompt).toContain("30-55%");
    expect(prompt).toContain("compressed prompt");
  });

  it("enhance mode includes role definition instruction", () => {
    const prompt = buildSystemPrompt("enhance", "auto");
    expect(prompt).toContain("role definition");
  });

  it("rewrite mode targets clarity", () => {
    const prompt = buildSystemPrompt("rewrite", "auto");
    expect(prompt).toContain("precise");
  });

  it("gpt-4o target includes markdown hint", () => {
    const prompt = buildSystemPrompt("rewrite", "gpt-4o");
    expect(prompt).toContain("markdown");
  });

  it("gpt-4o-mini target includes concise markdown hint", () => {
    const prompt = buildSystemPrompt("compress", "gpt-4o-mini");
    expect(prompt).toContain("markdown");
  });

  it("tone mode includes the tone parameter", () => {
    const prompt = buildSystemPrompt("tone", "auto", "casual");
    expect(prompt).toContain("casual");
  });

  it("tone mode defaults to formal when tone not provided", () => {
    const prompt = buildSystemPrompt("tone", "auto");
    expect(prompt).toContain("formal");
  });

  it("qa mode mentions clarifying questions", () => {
    const prompt = buildSystemPrompt("qa", "auto");
    expect(prompt).toContain("clarifying questions");
  });

  it("template mode mentions placeholders", () => {
    const prompt = buildSystemPrompt("template", "auto");
    expect(prompt).toContain("placeholders");
  });
});

describe("countTokensApprox", () => {
  it("delegates to countTokens (backward compat)", () => {
    expect(countTokensApprox("")).toBe(countTokens(""));
    expect(countTokensApprox("hello world")).toBe(countTokens("hello world"));
  });
});

describe("countTokens", () => {
  it("returns 0 for empty string", () => {
    expect(countTokens("")).toBe(0);
  });

  it("estimates tokens for short prose", () => {
    const result = countTokens("hello world");
    expect(result).toBeGreaterThan(0);
    // "hello world" = 2 words * 1.3 = 2.6 → 3, or 11 chars / 4 = 2.75 → 3
    expect(result).toBe(3);
  });

  it("estimates tokens for code-like content", () => {
    const code = 'const x = { foo: "bar" };';
    const result = countTokens(code);
    // Code-like content uses word count * 1.1 instead of 1.3
    expect(result).toBeGreaterThan(0);
  });

  it("respects mode ratio parameter", () => {
    // Use one long word (low word count) so char-based estimate dominates
    const longText = "supercalifragilisticexpialidocious".repeat(5); // 170 chars
    const compressTokens = countTokens(longText, "compress");
    // compress uses 3.5 chars/token → 170/3.5 ≈ 49
    const enhanceTokens = countTokens(longText, "enhance");
    // enhance uses 4.5 chars/token → 170/4.5 ≈ 38
    expect(compressTokens).toBeGreaterThan(enhanceTokens);
  });

  it("returns 1 for whitespace-only input (char fallback)", () => {
    // Whitespace still has characters so gets a minimal token estimate
    expect(countTokens("   ")).toBe(1);
  });
});

describe("PLAN_LIMITS", () => {
  it("free plan has 10000 requests/day", () => {
    expect(PLAN_LIMITS.free.requestsPerDay).toBe(10000);
  });

  it("pro plan has 10000 requests/day", () => {
    expect(PLAN_LIMITS.pro.requestsPerDay).toBe(10000);
  });

  it("team plan has 10000 requests/day", () => {
    expect(PLAN_LIMITS.team.requestsPerDay).toBe(10000);
  });
});

describe("ALL_MODES", () => {
  it("contains all 7 optimization modes", () => {
    expect(ALL_MODES).toHaveLength(7);
    expect(ALL_MODES).toContain("auto");
    expect(ALL_MODES).toContain("compress");
    expect(ALL_MODES).toContain("enhance");
    expect(ALL_MODES).toContain("rewrite");
    expect(ALL_MODES).toContain("tone");
    expect(ALL_MODES).toContain("qa");
    expect(ALL_MODES).toContain("template");
  });
});
