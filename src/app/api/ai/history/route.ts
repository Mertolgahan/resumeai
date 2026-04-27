import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const type = searchParams.get("type");
  const offset = (page - 1) * limit;

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let query = getSupabaseAdmin()
    .from("ai_generations")
    .select("id, type, prompt, result, model, provider, tokens_input, tokens_output, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq("type", type);
  }

  const { data: generations, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }

  return NextResponse.json({
    generations: generations || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Generation ID is required" }, { status: 400 });
  }

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { error } = await getSupabaseAdmin()
    .from("ai_generations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete generation" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}