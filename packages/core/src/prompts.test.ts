import { describe, it, expect } from "vitest";
import { buildSystemPrompt, countTokensApprox } from "./prompts";
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

  it("claude target includes XML tag instruction", () => {
    const prompt = buildSystemPrompt("rewrite", "claude");
    expect(prompt).toContain("XML tags");
  });

  it("midjourney target includes comma-separated instruction", () => {
    const prompt = buildSystemPrompt("compress", "midjourney");
    expect(prompt).toContain("comma-separated");
  });

  it("gpt4o target includes markdown instruction", () => {
    const prompt = buildSystemPrompt("enhance", "gpt4o");
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
  it("approximates tokens by character count", () => {
    expect(countTokensApprox("")).toBe(0);
    expect(countTokensApprox("test")).toBe(1);
    expect(countTokensApprox("hello world")).toBe(3);
  });

  it("rounds up partial tokens", () => {
    expect(countTokensApprox("abc")).toBe(1);
    expect(countTokensApprox("abcde")).toBe(2);
  });
});

describe("PLAN_LIMITS", () => {
  it("free plan has 25 requests/day", () => {
    expect(PLAN_LIMITS.free.requestsPerDay).toBe(25);
  });

  it("pro plan has 500 requests/day", () => {
    expect(PLAN_LIMITS.pro.requestsPerDay).toBe(500);
  });

  it("team plan has 500 requests/seat/day", () => {
    expect(PLAN_LIMITS.team.requestsPerDay).toBe(500);
  });
});

describe("ALL_MODES", () => {
  it("contains all 6 optimization modes", () => {
    expect(ALL_MODES).toHaveLength(6);
    expect(ALL_MODES).toContain("compress");
    expect(ALL_MODES).toContain("enhance");
    expect(ALL_MODES).toContain("rewrite");
    expect(ALL_MODES).toContain("tone");
    expect(ALL_MODES).toContain("qa");
    expect(ALL_MODES).toContain("template");
  });
});
