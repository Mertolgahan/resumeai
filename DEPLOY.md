# ResumeAI MVP — Deployment Guide

This guide covers every step to deploy ResumeAI from zero to production.

## Prerequisites

- GitHub account (free)
- Vercel account (free hobby tier)
- Supabase account (free tier)
- Stripe account (free, pay-as-you-go)
- OpenAI API key (pay-as-you-go, ~$0.01-0.10/resume)

## Step-by-Step Deployment

### 1. GitHub Repository

```bash
# Auth with GitHub CLI
gh auth login

# Create repo (or create at https://github.com/new)
gh repo create resumeai --public --description "AI-Powered Resume & Cover Letter Builder"

# Add remote and push
cd resumeai
git remote add origin https://github.com/<YOUR_USER>/resumeai.git
git push -u origin master
```

### 2. Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name (e.g., `resumeai-prod`) and a strong database password
3. Select the closest region
4. Wait for the project to provision (~2 minutes)
5. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
6. Go to **SQL Editor** and paste+run the contents of `supabase/schema.sql`
7. Go to **Authentication → Providers** and enable:
   - Email (enabled by default)
   - Google (optional, requires OAuth credentials from Google Cloud Console)

### 3. Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. In the **Dashboard**, create two products:

   **Pro Monthly ($9/month):**
   - Click "Add product"
   - Name: `Pro Monthly`
   - Pricing: Recurring → $9.00/month
   - Copy the `price_id` (starts with `price_`)

   **Lifetime ($29 one-time):**
   - Click "Add product"
   - Name: `Lifetime`
   - Pricing: One-time → $29.00
   - Copy the `price_id` (starts with `price_`)

3. Get API keys from **Developers → API keys**:
   - `Secret key` → `STRIPE_SECRET_KEY`
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

4. **After deployment**: Set up webhook (see Step 6)

### 4. OpenAI

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy it → `OPENAI_API_KEY`
4. Ensure your account has billing enabled and GPT-4o-mini access

### 5. Vercel Deployment

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# First deployment (interactive - follow prompts)
cd resumeai
vercel

# Set environment variables
./set-vercel-env.sh

# Or set manually:
# vercel env add NEXT_PUBLIC_SUPABASE_URL production
# vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# ... etc for each env var

# Deploy to production with env vars
vercel --prod
```

**Or via Vercel Dashboard (easier):**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repo
3. Framework: Next.js (auto-detected)
4. Add all environment variables from `.env.production.template`
5. Click "Deploy"

### 6. Stripe Webhook (After Deployment)

After Vercel gives you a URL (e.g., `https://resumeai.vercel.app`):

1. Go to [Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://resumeai.vercel.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the "Signing secret" → `STRIPE_WEBHOOK_SECRET`
6. Update the env var in Vercel:
   ```bash
   echo "whsec_xxx" | vercel env add STRIPE_WEBHOOK_SECRET production
   vercel --prod  # redeploy with webhook secret
   ```

### 7. Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your domain
3. Configure DNS at your registrar:
   - CNAME: `resumeai.yourdomain.com` → `cname.vercel-dns.com`
4. Update `NEXT_PUBLIC_APP_URL` in Vercel env to `https://resumeai.yourdomain.com`

## Environment Variables Summary

| Variable | Source | Example |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API | `eyJhbGci...` |
| `OPENAI_API_KEY` | OpenAI API Keys | `sk-proj-...` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API | `pk_live_...` |
| `STRIPE_PRO_PRICE_ID` | Stripe Products | `price_1P...` |
| `STRIPE_LIFETIME_PRICE_ID` | Stripe Products | `price_1P...` |
| `NEXT_PUBLIC_APP_URL` | Vercel deployment | `https://resumeai.vercel.app` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks | `whsec_...` |

## Quick Deploy (One Command)

After filling in `.env.production`:

```bash
./deploy.sh
```

This script will:
1. Validate .env.production exists
2. Create GitHub repo and push code
3. Prompt for manual Supabase/Stripe/OpenAI setup
4. Deploy to Vercel and set env vars

## Testing Checklist

After deployment, verify:
- [ ] Landing page loads at production URL
- [ ] User signup works (email + password)
- [ ] Free tier allows 1 resume generation
- [ ] AI resume generation returns content
- [ ] Stripe checkout for Pro ($9/mo) works
- [ ] Stripe checkout for Lifetime ($29) works
- [ ] Webhook processes payment events
- [ ] Dashboard shows user's resumes
- [ ] Cover letter generation works for Pro/Lifetime users

## Monthly Cost Estimate

| Service | Cost |
|---------|------|
| Vercel Hobby | $0 |
| Supabase Free | $0 |
| OpenAI API | ~$0.01-0.10/resume |
| Stripe | % of transactions |
| Domain (optional) | ~$1/year |
| **Total** | **~$0-2/month + API usage** |