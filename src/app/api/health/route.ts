import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const services = {
    supabase: !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
    stripe: !!(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY),
    auth: !!env.NEXTAUTH_SECRET,
    openrouter: !!env.OPENROUTER_API_KEY,
    googleOAuth: !!env.GOOGLE_CLIENT_ID,
    githubOAuth: !!env.GITHUB_CLIENT_ID,
    resend: !!env.RESEND_API_KEY,
  };

  const criticalOk = services.auth;
  const allOk = criticalOk && services.supabase && services.stripe && services.openrouter;

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