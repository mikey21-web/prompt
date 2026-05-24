import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/detect-modality
 *
 * Accepts either:
 *   - { imageBase64: string, mimeType: string }  — screenshot/image upload
 *   - { url: string }                             — URL to describe
 *
 * Returns:
 *   { modality: "text"|"image"|"video"|"audio"|"code", suggestedTarget: string, description: string }
 *
 * Uses Gemini Vision (gemini-2.5-flash) for image analysis.
 * Falls back to a simple URL-pattern heuristic if no Gemini key is set.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    // ── URL heuristic (no vision needed) ──────────────────────────────────
    if (typeof body.url === "string") {
      const result = detectFromUrl(body.url);
      return NextResponse.json(result);
    }

    // ── Image / screenshot via Gemini Vision ──────────────────────────────
    if (typeof body.imageBase64 === "string") {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        // Graceful fallback: return generic text modality
        return NextResponse.json({
          modality: "text",
          suggestedTarget: "claude-sonnet-4.5",
          description:
            "Gemini Vision not configured (GEMINI_API_KEY missing). Defaulting to text.",
        });
      }

      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are a prompt-engineering analyst. Look at this screenshot or image and determine:
1. What kind of AI prompt the user is likely trying to write (text generation, image generation, video generation, audio/music, or code).
2. The best target AI model for this use case.
3. A one-sentence plain-English description of what the user wants to accomplish.

Respond ONLY with valid JSON in this exact shape:
{
  "modality": "text" | "image" | "video" | "audio" | "code",
  "suggestedTarget": "<model-id from: claude-sonnet-4.5, gpt-4o, gemini-2.5-pro, midjourney-v7, dalle-3, stable-diffusion-xl, sora-2, runway-gen-3, veo-3, suno-v4, elevenlabs>",
  "description": "<one sentence plain English description>"
}`;

      const mimeType = (body.mimeType as string) || "image/png";
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: body.imageBase64,
          },
        },
      ]);

      const text = result.response.text().trim();
      // Strip markdown code fences if present
      const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "");

      try {
        const parsed = JSON.parse(cleaned);
        logger.info("detect-modality.vision", { userId, modality: parsed.modality });
        return NextResponse.json(parsed);
      } catch {
        logger.error("detect-modality.parse-error", { text });
        return NextResponse.json({
          modality: "text",
          suggestedTarget: "claude-sonnet-4.5",
          description: text.slice(0, 200),
        });
      }
    }

    return NextResponse.json(
      { error: "Provide either imageBase64 or url" },
      { status: 400 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Detection failed";
    logger.error("detect-modality.error", { err: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── URL heuristic ──────────────────────────────────────────────────────────

interface DetectionResult {
  modality: "text" | "image" | "video" | "audio" | "code";
  suggestedTarget: string;
  description: string;
}

function detectFromUrl(url: string): DetectionResult {
  const lower = url.toLowerCase();

  // Video platforms
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com") ||
    lower.includes("tiktok.com") ||
    lower.includes("sora") ||
    lower.includes("runway")
  ) {
    return {
      modality: "video",
      suggestedTarget: "sora-2",
      description: "Video content detected from URL.",
    };
  }

  // Image platforms
  if (
    lower.includes("midjourney") ||
    lower.includes("dalle") ||
    lower.includes("stability.ai") ||
    lower.includes("civitai") ||
    lower.includes("artstation") ||
    lower.includes("deviantart") ||
    lower.includes(".png") ||
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".webp")
  ) {
    return {
      modality: "image",
      suggestedTarget: "midjourney-v7",
      description: "Image content detected from URL.",
    };
  }

  // Audio platforms
  if (
    lower.includes("suno") ||
    lower.includes("udio") ||
    lower.includes("soundcloud") ||
    lower.includes("spotify") ||
    lower.includes("elevenlabs") ||
    lower.includes(".mp3") ||
    lower.includes(".wav")
  ) {
    return {
      modality: "audio",
      suggestedTarget: "suno-v4",
      description: "Audio content detected from URL.",
    };
  }

  // Code platforms
  if (
    lower.includes("github.com") ||
    lower.includes("gitlab.com") ||
    lower.includes("codepen") ||
    lower.includes("replit") ||
    lower.includes("codesandbox") ||
    lower.includes("stackoverflow")
  ) {
    return {
      modality: "code",
      suggestedTarget: "claude-sonnet-4.5",
      description: "Code content detected from URL.",
    };
  }

  // Default: text
  return {
    modality: "text",
    suggestedTarget: "claude-sonnet-4.5",
    description: "Text content assumed from URL.",
  };
}
