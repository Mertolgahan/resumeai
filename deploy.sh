#!/usr/bin/env bash
set -euo pipefail

# ResumeAI MVP — Deployment Setup Script
# Run this script after creating external accounts to deploy ResumeAI to production.
# Prerequisites: gh (GitHub CLI), vercel (Vercel CLI), supabase (Supabase CLI), stripe (Stripe CLI)

REPO_NAME="resumeai"
REPO_DESC="AI-Powered Resume & Cover Letter Builder — ResumeAI MVP"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "======================================="
echo " ResumeAI MVP — Deployment Setup"
echo "======================================="
echo ""

# --- Step 0: Check prerequisites ---
echo "📋 Checking prerequisites..."
for cmd in git node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "❌ Required command not found: $cmd"
    exit 1
  fi
done

# --- Step 1: Load environment ---
if [ ! -f "$SCRIPT_DIR/.env.production" ]; then
  echo "❌ .env.production not found. Create it from .env.production.template first."
  echo "   cp .env.production.template .env.production"
  echo "   Then fill in your actual credentials."
  exit 1
fi

# Source the production env
set -a; source "$SCRIPT_DIR/.env.production"; set +a

echo "✅ Environment loaded"
echo ""

# --- Step 2: GitHub Repo ---
echo "📦 Step 1: Setting up GitHub repository..."

if gh auth status &>/dev/null 2>&1; then
  echo "   GitHub CLI authenticated."
  if gh repo view "$REPO_NAME" &>/dev/null 2>&1; then
    echo "   Repository already exists: $REPO_NAME"
  else
    echo "   Creating GitHub repository: $REPO_NAME"
    gh repo create "$REPO_NAME" --public --description "$REPO_DESC"
  fi

  # Add remote if not already set
  if git remote get-url origin &>/dev/null 2>&1; then
    echo "   Git remote 'origin' already set: $(git remote get-url origin)"
  else
    REPO_URL=$(gh repo view "$REPO_NAME" --json url --jq '.url')
    git remote add origin "$REPO_URL.git"
    echo "   Added remote origin: $REPO_URL.git"
  fi

  # Push code
  echo "   Pushing code to GitHub..."
  git push -u origin master 2>/dev/null || git push -u origin main 2>/dev/null
  echo "✅ Code pushed to GitHub"
else
  echo "⚠️  GitHub CLI not authenticated. Manual steps:"
  echo "   1. Create repo at https://github.com/new (name: $REPO_NAME)"
  echo "   2. Run: gh auth login"
  echo "   3. Run: git remote add origin https://github.com/<YOUR_USER>/$REPO_NAME.git"
  echo "   4. Run: git push -u origin master"
  echo "   Then re-run this script."
  exit 1
fi
echo ""

# --- Step 3: Supabase ---
echo "🗄️  Step 2: Supabase setup..."
echo ""
echo "   If you haven't already:"
echo "   1. Go to https://supabase.com and create a new project"
echo "   2. Copy the project URL and anon key from Settings > API"
echo "   3. Copy the service role key from Settings > API (keep secret!)"
echo "   4. Go to SQL Editor and run: supabase/schema.sql"
echo "   5. Go to Authentication > Providers and enable Email + Google"
echo ""
echo "   Values should be set in .env.production:"
echo "   NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=$(echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | cut -c1-10)..."
echo ""

# --- Step 4: Stripe ---
echo "💳 Step 3: Stripe setup..."
echo ""
echo "   Create products and prices in Stripe Dashboard (or CLI):"
echo "   1. Go to https://dashboard.stripe.com/products"
echo "   2. Create product 'Pro Monthly' — $9/month recurring"
echo "   3. Create product 'Lifetime' — $29 one-time"
echo "   4. Copy price IDs to .env.production"
echo ""
echo "   Or use Stripe CLI:"
echo "   stripe products create --name='Pro Monthly' --type=service"
echo "   stripe prices create --product=<pro_product_id> --unit-amount=900 --currency=usd --recurring[interval]=month"
echo "   stripe products create --name='Lifetime' --type=service"
echo "   stripe prices create --product=<lifetime_product_id> --unit-amount=2900 --currency=usd"
echo ""
echo "   Values in .env.production:"
echo "   STRIPE_PRO_PRICE_ID=$STRIPE_PRO_PRICE_ID"
echo "   STRIPE_LIFETIME_PRICE_ID=$STRIPE_LIFETIME_PRICE_ID"
echo ""

# --- Step 5: Vercel ---
echo "🚀 Step 4: Vercel deployment..."
echo ""

if command -v vercel &>/dev/null; then
  echo "   Deploying to Vercel..."
  cd "$SCRIPT_DIR"

  # Deploy (first time = interactive project setup)
  vercel --prod --yes 2>/dev/null || {
    echo ""
    echo "   First deployment requires interactive setup. Run manually:"
    echo "   cd $SCRIPT_DIR && vercel"
    echo ""
    echo "   Then set environment variables:"
    echo "   vercel env add NEXT_PUBLIC_SUPABASE_URL"
    echo "   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   vercel env add SUPABASE_SERVICE_ROLE_KEY"
    echo "   vercel env add OPENAI_API_KEY"
    echo "   vercel env add STRIPE_SECRET_KEY"
    echo "   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    echo "   vercal env add STRIPE_PRO_PRICE_ID"
    echo "   vercel env add STRIPE_LIFETIME_PRICE_ID"
    echo "   vercel env add NEXT_PUBLIC_APP_URL"
    echo "   vercel env add STRIPE_WEBHOOK_SECRET"
    echo ""
    echo "   Or use the one-liner (after first deploy):"
    echo "   ./set-vercel-env.sh"
    echo ""
    exit 1
  }

  # Set env vars using Vercel CLI
  echo "   Setting environment variables..."
  echo "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
  echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
  echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
  echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY production
  echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production
  echo "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
  echo "$STRIPE_PRO_PRICE_ID" | vercel env add STRIPE_PRO_PRICE_ID production
  echo "$STRIPE_LIFETIME_PRICE_ID" | vercel env add STRIPE_LIFETIME_PRICE_ID production
  echo "$NEXT_PUBLIC_APP_URL" | vercel env add NEXT_PUBLIC_APP_URL production
  echo "$STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production

  # Redeploy with env vars
  echo "   Redeploying with environment variables..."
  vercel --prod --yes
  echo "✅ Deployed to Vercel"
else
  echo "⚠️  Vercel CLI not found. Manual steps:"
  echo "   1. Install: npm i -g vercel"
  echo "   2. Run: cd $SCRIPT_DIR && vercel"
  echo "   3. Import from GitHub repo in Vercel dashboard"
  echo "   4. Set all env vars in Vercel dashboard"
  echo "   5. Deploy"
fi
echo ""

# --- Step 6: Stripe Webhook ---
echo "🔗 Step 5: Stripe webhook setup..."
echo ""
echo "   After Vercel deployment, set up Stripe webhook:"
echo "   1. Go to https://dashboard.stripe.com/webhooks"
echo "   2. Add endpoint: https://<your-vercel-domain>/api/stripe/webhook"
echo "   3. Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted"
echo "   4. Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET in .env.production"
echo "   5. Update the env var in Vercel"
echo ""

echo "======================================="
echo " Setup Complete!"
echo "======================================="
echo ""
echo "Your ResumeAI MVP should now be live at:"
echo "  $NEXT_PUBLIC_APP_URL"
echo ""
echo "Remaining manual steps (if any):"
echo "  - Verify Stripe webhook is receiving events"
echo "  - Test signup flow end-to-end"
echo "  - Test payment flow with Stripe test cards"
echo "  - Document all credentials in the team vault"