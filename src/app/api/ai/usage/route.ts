import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getUsage } from "@/lib/rate-limit";
import { PLANS, PlanType } from "@/lib/stripe";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("id, subscription_status")
    .eq("email", session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const planKey = (user.subscription_status === "active" ? "pro" : user.subscription_status || "free") as PlanType;
  const planConfig = PLANS[planKey] || PLANS.free;
  const usage = await getUsage(user.id);

  return NextResponse.json({
    plan: planConfig.name,
    dailyUsage: usage.dailyCount,
    dailyLimit: planConfig.dailyLimit === -1 ? null : planConfig.dailyLimit,
    monthlyUsage: usage.monthlyCount,
    monthlyLimit: planConfig.monthlyLimit === -1 ? null : planConfig.monthlyLimit,
    projectLimit: planConfig.projectLimit === -1 ? null : planConfig.projectLimit,
  });
}