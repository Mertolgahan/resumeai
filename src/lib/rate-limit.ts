import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import { PLANS, PlanType } from "./stripe";

interface UsageData {
  dailyCount: number;
  monthlyCount: number;
}

export async function getUsage(userId: string): Promise<UsageData> {
  if (!isSupabaseConfigured) {
    return { dailyCount: 0, monthlyCount: 0 };
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [dailyRes, monthlyRes] = await Promise.all([
    getSupabaseAdmin()
      .from("api_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfDay),
    getSupabaseAdmin()
      .from("api_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth),
  ]);

  return {
    dailyCount: dailyRes.count || 0,
    monthlyCount: monthlyRes.count || 0,
  };
}

export async function checkRateLimit(
  userId: string,
  plan: string
): Promise<{ allowed: boolean; reason?: string }> {
  const planKey = (plan === "active" ? "pro" : plan || "free") as PlanType;
  const planConfig = PLANS[planKey] || PLANS.free;
  const usage = await getUsage(userId);

  if (planConfig.dailyLimit !== -1 && usage.dailyCount >= planConfig.dailyLimit) {
    return {
      allowed: false,
      reason: `Daily limit reached (${planConfig.dailyLimit} generations/day for ${planConfig.name} plan). Upgrade for higher limits.`,
    };
  }

  if (planConfig.monthlyLimit !== -1 && usage.monthlyCount >= planConfig.monthlyLimit) {
    return {
      allowed: false,
      reason: `Monthly limit reached (${planConfig.monthlyLimit} generations/month for ${planConfig.name} plan). Upgrade for higher limits.`,
    };
  }

  return { allowed: true };
}

export async function recordUsage(
  userId: string,
  endpoint: string,
  model: string,
  tokensInput: number,
  tokensOutput: number,
  provider: string
): Promise<void> {
  if (!isSupabaseConfigured) return;
  await getSupabaseAdmin().from("api_usage").insert({
    user_id: userId,
    endpoint,
    model,
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    provider,
  });
}