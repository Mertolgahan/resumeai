const PLACEHOLDER_PATTERN = /^(placeholder|your-|xxx|change-me|\[NEEDED\]|sk_test_placeholder|pk_test_placeholder|whsec_placeholder|re_placeholder|price_placeholder)/i;

function cleanEnv(value: string | undefined, fallback: string = ""): string {
  const v = value || "";
  if (!v || PLACEHOLDER_PATTERN.test(v)) return "";
  return v;
}

export const env = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://the-exp.net",
  SUPABASE_URL: cleanEnv(process.env.SUPABASE_URL),
  SUPABASE_ANON_KEY: cleanEnv(process.env.SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),
  STRIPE_SECRET_KEY: cleanEnv(process.env.STRIPE_SECRET_KEY),
  STRIPE_PUBLISHABLE_KEY: cleanEnv(process.env.STRIPE_PUBLISHABLE_KEY),
  STRIPE_WEBHOOK_SECRET: cleanEnv(process.env.STRIPE_WEBHOOK_SECRET),
  STRIPE_STARTER_PRICE_ID: cleanEnv(process.env.STRIPE_STARTER_PRICE_ID),
  STRIPE_STARTER_YEARLY_PRICE_ID: cleanEnv(process.env.STRIPE_STARTER_YEARLY_PRICE_ID),
  STRIPE_PRO_PRICE_ID: cleanEnv(process.env.STRIPE_PRO_PRICE_ID),
  STRIPE_PRO_YEARLY_PRICE_ID: cleanEnv(process.env.STRIPE_PRO_YEARLY_PRICE_ID),
  STRIPE_ENTERPRISE_PRICE_ID: cleanEnv(process.env.STRIPE_ENTERPRISE_PRICE_ID),
  STRIPE_ENTERPRISE_YEARLY_PRICE_ID: cleanEnv(process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID),
  RESEND_API_KEY: cleanEnv(process.env.RESEND_API_KEY),
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "noreply@localhost",
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  OLLAMA_DEFAULT_MODEL: process.env.OLLAMA_DEFAULT_MODEL || "llama3.1:8b",
  OPENROUTER_API_KEY: cleanEnv(process.env.OPENROUTER_API_KEY),
  OPENROUTER_DEFAULT_MODEL: process.env.OPENROUTER_DEFAULT_MODEL || "openai/gpt-4o-mini",
  GOOGLE_CLIENT_ID: cleanEnv(process.env.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: cleanEnv(process.env.GOOGLE_CLIENT_SECRET),
  GITHUB_CLIENT_ID: cleanEnv(process.env.GITHUB_CLIENT_ID),
  GITHUB_CLIENT_SECRET: cleanEnv(process.env.GITHUB_CLIENT_SECRET),
};

const CRITICAL_ENV_VARS = [
  "NEXTAUTH_SECRET",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
] as const;

const OPTIONAL_SERVICES: Record<string, string[]> = {
  "Stripe (payments)": [
    env.STRIPE_SECRET_KEY ? "STRIPE_SECRET_KEY" : "",
    env.STRIPE_PUBLISHABLE_KEY ? "STRIPE_PUBLISHABLE_KEY" : "",
  ].filter(Boolean),
  "OAuth (Google)": [env.GOOGLE_CLIENT_ID ? "GOOGLE_CLIENT_ID" : ""].filter(Boolean),
  "OAuth (GitHub)": [env.GITHUB_CLIENT_ID ? "GITHUB_CLIENT_ID" : ""].filter(Boolean),
  "AI (OpenRouter)": [env.OPENROUTER_API_KEY ? "OPENROUTER_API_KEY" : ""].filter(Boolean),
  "Email (Resend)": [env.RESEND_API_KEY ? "RESEND_API_KEY" : ""].filter(Boolean),
};

if (typeof window === "undefined") {
  const missing = CRITICAL_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `[env] CRITICAL: Missing required env vars: ${missing.join(", ")}. Auth and database will not work.`
    );
  }

  const available: string[] = [];
  const unavailable: string[] = [];
  for (const [service, vars] of Object.entries(OPTIONAL_SERVICES)) {
    if (vars.length > 0) available.push(service);
    else unavailable.push(service);
  }
  if (available.length) {
    console.log(`[env] Configured services: ${available.join(", ")}`);
  }
  if (unavailable.length) {
    console.warn(
      `[env] Not configured (features disabled): ${unavailable.join(", ")}`
    );
  }
}