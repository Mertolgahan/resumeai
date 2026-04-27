import { NextResponse } from "next/server";

export async function GET() {
  const services = {
    supabase: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    supabaseAdmin: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    stripe: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
  };

  // For this MVP:
  // - Supabase anon key + OpenRouter are required for core features
  // - Service role key & Stripe are optional for v1
  const criticalOk = services.supabase && services.openrouter;
  const allOk = criticalOk && services.supabaseAdmin && services.stripe;

  return NextResponse.json(
    {
      status: allOk ? "ok" : criticalOk ? "degraded" : "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0",
      services,
    },
    { status: criticalOk ? 200 : 503 }
  );
}