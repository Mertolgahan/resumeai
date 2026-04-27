#!/bin/bash
# ============================================================
# SaaSKit Pro — Service Account Provisioning Guide
# ============================================================
# This script is a STEP-BY-STEP GUIDE for humans to provision
# all required service accounts and populate .env
#
# Run each section manually. After all [NEEDED] values are
# filled, run:  ./scripts/deploy.sh
# ============================================================

set -euo pipefail

ENV_FILE=".env"
PROD_ENV=".env.production"

if [ ! -f "$PROD_ENV" ]; then
    echo "Error: .env.production not found. Generate it first."
    exit 1
fi

echo "=== SaaSKit Pro — Service Account Provisioning ==="
echo ""
echo "This guide walks you through creating all required accounts."
echo "After completing each step, fill in the values in: $ENV_FILE"
echo ""

echo "============================================"
echo "STEP 1: Supabase (Database + Auth)"
echo "============================================"
echo ""
echo "1. Open https://supabase.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Name: saaskit-pro"
echo "4. Database password: (generate and save!)"
echo "5. Region: us-east-1 (or closest)"
echo "6. Wait for project to provision (~2 min)"
echo "7. Go to Project Settings → API"
echo "8. Copy these values to $ENV_FILE:"
echo "   SUPABASE_URL = Project URL"
echo "   SUPABASE_ANON_KEY = anon public key"
echo "   SUPABASE_SERVICE_ROLE_KEY = service_role key"
echo ""
echo "9. Run migrations (requires Supabase CLI):"
echo "   npx supabase login"
echo "   npx supabase link --project-ref <your-project-ref>"
echo "   npx supabase db push"
echo ""
echo "10. Seed demo data (in Supabase SQL Editor):"
echo "    Copy contents of: supabase/seed-demo.sql"
echo ""
read -p "Supabase configured? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Complete Supabase setup before continuing."
    exit 1
fi

echo ""
echo "============================================"
echo "STEP 2: Stripe (Payments)"
echo "============================================"
echo ""
echo "1. Open https://dashboard.stripe.com/register"
echo "2. Create account and verify email"
echo "3. Get API keys from Developers → API Keys"
echo "4. Update $ENV_FILE:"
echo "   STRIPE_SECRET_KEY = sk_test_..."
echo "   STRIPE_PUBLISHABLE_KEY = pk_test_..."
echo ""
echo "5. Create products & prices:"
echo "   export STRIPE_SECRET_KEY=sk_test_..."
echo "   ./scripts/setup-stripe.sh"
echo "   (outputs all STRIPE_*_PRICE_ID values)"
echo ""
echo "6. AFTER deploying, register webhook:"
echo "   URL: https://YOUR_DOMAIN/api/stripe/webhook"
echo "   Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted"
echo "   Copy signing secret to STRIPE_WEBHOOK_SECRET"
echo ""
read -p "Stripe configured? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Complete Stripe setup before continuing."
    exit 1
fi

echo ""
echo "============================================"
echo "STEP 3: Google OAuth"
echo "============================================"
echo ""
echo "1. Open https://console.cloud.google.com/"
echo "2. Create project: 'SaaSKit Pro'"
echo "3. APIs & Services → Credentials → Create Credentials → OAuth client ID"
echo "4. Application type: Web application"
echo "5. Authorized redirect URIs:"
echo "   https://YOUR_DOMAIN/api/auth/callback/google"
echo "6. Copy Client ID + Client Secret to .env"
echo ""
read -p "Google OAuth configured? (y/n) " -n 1 -r
echo

echo ""
echo "============================================"
echo "STEP 4: GitHub OAuth"
echo "============================================"
echo ""
echo "1. Open https://github.com/settings/developers"
echo "2. New OAuth App"
echo "3. Homepage URL: https://YOUR_DOMAIN"
echo "4. Callback URL: https://YOUR_DOMAIN/api/auth/callback/github"
echo "5. Generate client secret"
echo "6. Copy Client ID + Client Secret to .env"
echo ""
read -p "GitHub OAuth configured? (y/n) " -n 1 -r
echo

echo ""
echo "============================================"
echo "STEP 5: Resend (Email)"
echo "============================================"
echo ""
echo "1. Open https://resend.com/signup"
echo "2. Add domain, configure DNS (MX, SPF, DKIM)"
echo "3. Create API key"
echo "4. Update .env: RESEND_API_KEY, RESEND_FROM_EMAIL"
echo ""
read -p "Resend configured? (y/n) " -n 1 -r
echo

echo ""
echo "============================================"
echo "STEP 6: Final .env Setup"
echo "============================================"
echo ""
echo "Copy .env.production to .env and fill all [NEEDED] values:"
echo "  cp .env.production .env"
echo "  vim .env     # fill in all [NEEDED] values"
echo ""
echo "Then deploy:"
echo "  ./scripts/deploy.sh"
echo ""
echo "And verify:"
echo "  ./scripts/verify-deploy.sh YOUR_DOMAIN"
echo ""
echo "=== All service accounts provisioned ==="