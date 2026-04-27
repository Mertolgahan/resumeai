import { NextRequest, NextResponse } from "next/server";
import { generateContent, CONTENT_TYPE_CONFIG, ContentType } from "@/lib/content-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type = "blog_post", systemPrompt, model, maxTokens, temperature } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (prompt.length > 10000) {
      return NextResponse.json(
        { error: "Prompt must be under 10,000 characters" },
        { status: 400 }
      );
    }

    if (!CONTENT_TYPE_CONFIG[type as ContentType]) {
      return NextResponse.json(
        { error: `Invalid content type: ${type}` },
        { status: 400 }
      );
    }

    const result = await generateContent({
      prompt: prompt.trim(),
      type: type as ContentType,
      systemPrompt,
      model,
      maxTokens,
      temperature,
    });

    return NextResponse.json({
      result: result.text,
      model: result.model,
      provider: result.provider,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      type,
    });
  } catch (error) {
    console.error("ContentAI generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
