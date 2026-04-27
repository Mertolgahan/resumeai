import { auth } from "@/lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { aiProvider, CONTENT_TYPE_CONFIG, ContentType } from "@/lib/ai";
import { checkRateLimit, recordUsage } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return new Response(JSON.stringify({ error: "Service not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await auth();

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
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
    return new Response(JSON.stringify({ error: "Prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (prompt.length > 10000) {
    return new Response(
      JSON.stringify({ error: "Prompt must be under 10,000 characters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const contentTypeConfig = CONTENT_TYPE_CONFIG[type];
  if (!contentTypeConfig) {
    return new Response(
      JSON.stringify({
        error: `Invalid content type: ${type}`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("id, subscription_status")
    .eq("email", session.user.email)
    .single();

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rateLimit = await checkRateLimit(user.id, user.subscription_status || "free");
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: rateLimit.reason }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let fullText = "";
  let resultModel = model || "unknown";
  let resultProvider = "unknown";
  let tokensInput = 0;
  let tokensOutput = 0;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await aiProvider.generateStream(
          {
            prompt: prompt.trim(),
            systemPrompt: systemPrompt || contentTypeConfig.systemPrompt,
            model,
            stream: true,
          },
          {
            onToken(token: string) {
              fullText += token;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`)
              );
            },
            onComplete(result) {
              resultModel = result.model;
              resultProvider = result.provider;
              tokensInput = result.tokensInput;
              tokensOutput = result.tokensOutput;
            },
            onError(error: Error) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
                )
              );
              controller.close();
            },
          }
        );

        await recordUsage(
          user.id,
          `/api/ai/stream/${type}`,
          resultModel,
          tokensInput,
          tokensOutput,
          resultProvider
        );

        await getSupabaseAdmin().from("ai_generations").insert({
          user_id: user.id,
          project_id: projectId || null,
          type,
          prompt: prompt.trim(),
          result: fullText,
          model: resultModel,
          provider: resultProvider,
          tokens_input: tokensInput,
          tokens_output: tokensOutput,
        });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              model: resultModel,
              provider: resultProvider,
              tokensInput,
              tokensOutput,
            })}\n\n`
          )
        );
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}