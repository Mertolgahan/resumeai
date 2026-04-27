#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$SCRIPT_DIR/.env.production" ]; then
  echo "❌ .env.production not found. Create from .env.production.template first."
  exit 1
fi

set -a; source "$SCRIPT_DIR/.env.production"; set +a

echo "Setting Vercel environment variables from .env.production..."

printf '%s' "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
printf '%s' "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
printf '%s' "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
printf '%s' "$OPENROUTER_API_KEY" | vercel env add OPENROUTER_API_KEY production
printf '%s' "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production
printf '%s' "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
printf '%s' "$STRIPE_PRO_PRICE_ID" | vercel env add STRIPE_PRO_PRICE_ID production
printf '%s' "$STRIPE_LIFETIME_PRICE_ID" | vercel env add STRIPE_LIFETIME_PRICE_ID production
printf '%s' "$NEXT_PUBLIC_APP_URL" | vercel env add NEXT_PUBLIC_APP_URL production
printf '%s' "$STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production

echo "✅ All environment variables set. Run: vercel --prod"