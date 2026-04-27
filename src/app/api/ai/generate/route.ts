import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { aiProvider, CONTENT_TYPE_CONFIG, ContentType } from "@/lib/ai";
import { checkRateLimit, recordUsage } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    prompt,
    type = "blog_post",
    systemPrompt,
    model,
    projectId,
  } = body as {
    prompt?: string;
    type?: ContentType;
    systemPrompt?: string;
    model?: string;
    projectId?: string;
  };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  if (prompt.length > 10000) {
    return NextResponse.json(
      { error: "Prompt must be under 10,000 characters" },
      { status: 400 }
    );
  }

  const contentTypeConfig = CONTENT_TYPE_CONFIG[type];
  if (!contentTypeConfig) {
    return NextResponse.json(
      { error: `Invalid content type: ${type}. Valid types: ${Object.keys(CONTENT_TYPE_CONFIG).join(", ")}` },
      { status: 400 }
    );
  }

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("id, subscription_status")
    .eq("email", session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const rateLimit = await checkRateLimit(user.id, user.subscription_status || "free");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: rateLimit.reason },
      { status: 429 }
    );
  }

  try {
    const result = await aiProvider.generate({
      prompt: prompt.trim(),
      systemPrompt: systemPrompt || contentTypeConfig.systemPrompt,
      model,
    });

    await recordUsage(
      user.id,
      `/api/ai/generate/${type}`,
      result.model,
      result.tokensInput,
      result.tokensOutput,
      result.provider
    );

    await getSupabaseAdmin().from("ai_generations").insert({
      user_id: user.id,
      project_id: projectId || null,
      type,
      prompt: prompt.trim(),
      result: result.text,
      model: result.model,
      provider: result.provider,
      tokens_input: result.tokensInput,
      tokens_output: result.tokensOutput,
    });

    return NextResponse.json({
      result: result.text,
      model: result.model,
      provider: result.provider,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      type,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("AI generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}