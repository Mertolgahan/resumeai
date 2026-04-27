# SaaSKit Pro — Launch & Sales Channel Setup Guide

## Overview

This guide covers the complete launch setup for SaaSKit Pro (ContentAI). The SaaS boilerplate code is complete — this guide handles everything needed to go live.

---

## 1. Demo Deployment

### Prerequisites
- Server with Docker installed
- Domain pointing to server IP (see `domain-setup-guide.md`)
- SSL certificate (Let's Encrypt)

### Steps

```bash
# 1. Clone / upload the saas-kit project to the server
# 2. Create .env from .env.example and fill in all values
cp .env.example .env
# Edit .env with your actual values

# 3. Build and deploy with Docker
./scripts/deploy.sh

# 4. Setup SSL (first time only)
./scripts/setup-ssl.sh saaskit.pro hello@saaskit.pro

# 5. Update nginx.conf — replace YOUR_DOMAIN with your actual domain
sed -i 's/YOUR_DOMAIN/saaskit.pro/g' nginx.conf

# 6. Copy nginx config and start
sudo cp nginx.conf /etc/nginx/sites-available/saaskit.pro
sudo ln -sf /etc/nginx/sites-available/saaskit.pro /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Demo Test Account

After deployment, create a test account via the signup page or use the API:

```bash
curl -X POST https://saaskit.pro/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@saaskit.pro","password":"DemoPass123!"}'
```

Recommended demo account: `demo@saaskit.pro` / `DemoPass123!`

### Environment Variables Checklist

| Variable | Source | Notes |
|----------|--------|-------|
| `NEXTAUTH_URL` | Your domain | `https://saaskit.pro` |
| `NEXTAUTH_SECRET` | Random 32+ char string | `openssl rand -base64 32` |
| `SUPABASE_URL` | Supabase project | See Section 3 |
| `SUPABASE_ANON_KEY` | Supabase project | See Section 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project | See Section 3 |
| `STRIPE_SECRET_KEY` | Stripe dashboard | See Section 4 |
| `STRIPE_PUBLISHABLE_KEY` | Stripe dashboard | See Section 4 |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook setup | See Section 4 |
| `STRIPE_*_PRICE_ID` (x6) | Stripe products | Run `scripts/setup-stripe.sh` |
| `NEXT_PUBLIC_STRIPE_*_PRICE_ID` (x6) | Stripe products | Same as above |
| `RESEND_API_KEY` | Resend dashboard | See Section 6 |
| `RESEND_FROM_EMAIL` | Your domain | `noreply@saaskit.pro` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | See Section 5 |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | See Section 5 |
| `GITHUB_CLIENT_ID` | GitHub Developer Settings | See Section 5 |
| `GITHUB_CLIENT_SECRET` | GitHub Developer Settings | See Section 5 |
| `OLLAMA_BASE_URL` | Optional | `http://localhost:11434` or remove |
| `OLLAMA_DEFAULT_MODEL` | Optional | `llama3.1:8b` or remove |
| `OPENROUTER_API_KEY` | OpenRouter | Required for AI features |
| `OPENROUTER_DEFAULT_MODEL` | OpenRouter | `openai/gpt-4o-mini` |

---

## 2. Gumroad / LemonSqueezy Product Page

### Product Page Copy

**Product Name:** SaaSKit Pro — Next.js 16 SaaS Boilerplate

**Tagline:** Ship your SaaS in days, not months. Production-ready Next.js 16 + Supabase + Stripe + AI.

**Description:**

> Stop building from scratch. SaaSKit Pro gives you everything you need to launch your SaaS product — authentication, payments, AI integration, and a beautiful UI — all pre-built and production-ready.
>
> Built with Next.js 16 (App Router), Supabase, Stripe, and NextAuth v5. Includes 7 AI content types, real-time streaming, usage analytics, and dark mode out of the box.

**Key Features (Bullet Points):**

- ✅ Next.js 16 App Router + React 19 + TypeScript
- ✅ Supabase (Postgres + Auth + RLS) — no custom backend needed
- ✅ NextAuth v5 — Google, GitHub, email/password login
- ✅ Stripe — Subscriptions, checkout, billing portal, webhooks
- ✅ 7 AI Content Types — Blog, Social, SEO, Product Descriptions, Email, Ads
- ✅ Streaming AI — Real-time token delivery via SSE
- ✅ Smart Provider Fallback — Ollama (self-hosted) → OpenRouter (cloud)
- ✅ Usage-Based Rate Limiting — Per-plan daily & monthly limits
- ✅ Dark Mode — Full theme support with system detection
- ✅ SEO Optimized — Sitemap, robots.txt, JSON-LD structured data
- ✅ Responsive Design — Mobile-first UI with shadcn/ui components
- ✅ Production Docker Deployment — Dockerfile + nginx + SSL included
- ✅ Clean Architecture — Easy to extend and customize

**Pricing:**
- **Early Bird:** $149 (first 50 customers)
- **Regular Price:** $249

**What's Included:**
- Full source code (MIT license for personal use, Commercial license for business)
- Free updates for 1 year
- Dockerfile + deployment scripts
- Documentation + setup guide

**Screenshot Checklist** (prepare before launch):
1. Landing page hero section
2. Dashboard overview
3. AI content generation (streaming demo)
4. Pricing page
5. Dark mode variant
6. Mobile responsive views
7. Usage analytics dashboard
8. Stripe checkout flow

---

## 3. Supabase Project Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Project name: `saaskit-pro`
3. Database password: (generate strong password)
4. Region: Choose closest to your target audience
5. Wait for project to provision (~2 min)

### Run Migrations

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

Or run migrations manually via the SQL Editor in the Supabase dashboard:

1. Open SQL Editor
2. Copy contents of `supabase/migrations/001_initial.sql`
3. Run
4. Copy contents of `supabase/migrations/002_ai_features.sql`
5. Run

### Get API Keys

From Project Settings → API:
- `SUPABASE_URL`: Project URL
- `SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep secret!)

### Enable Email Auth

1. Go to Authentication → Providers
2. Enable Email provider (enabled by default)
3. Configure email confirmation settings as desired

### Demo Data (Optional)

```sql
-- Insert a demo user (password: DemoPass123!)
-- bcrypt hash for 'DemoPass123!' generated with 12 rounds
INSERT INTO users (id, email, name, password_hash, subscription_status)
VALUES (
  gen_random_uuid(),
  'demo@saaskit.pro',
  'Demo User',
  '$2a$12$LJ3m4ys3G6mKz1z5qH8XOeK0vN2rT9wY1xL5kQ7mP3nR8sU0vW2yA',
  'free'
) ON CONFLICT (email) DO NOTHING;
```

---

## 4. Stripe Products Setup

### Quick Setup (Recommended)

```bash
# Set your Stripe secret key
export STRIPE_SECRET_KEY=sk_test_...

# Run the setup script
./scripts/setup-stripe.sh
```

This creates all products and prices and outputs the env vars for your `.env` file.

### Manual Setup

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create 3 products: Starter, Pro, Enterprise
3. Add monthly and yearly prices for each
4. Copy price IDs to `.env`

### Plans Reference

| Plan | Monthly | Yearly | Daily Limit | Monthly Limit |
|------|---------|--------|-------------|---------------|
| Free | $0 | $0 | 10 | 100 |
| Starter | $9 | $90 | 100 | 3,000 |
| Pro | $29 | $290 | 1,000 | 30,000 |
| Enterprise | $99 | $990 | Unlimited | Unlimited |

### Webhook Setup

1. Deploy the app first
2. Go to Stripe Dashboard → Developers → Webhooks
3. Add endpoint: `https://saaskit.pro/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### Test mode

Use Stripe test mode first:
- Test card: `4242 4242 4242 4242`
- Any future expiry, any CVC, any postal code
- Verify webhook delivery in Stripe dashboard

---

## 5. OAuth Application Registration

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: `SaaSKit Pro`
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Name: `SaaSKit Pro`
7. Authorized JavaScript origins:
   - `https://saaskit.pro`
   - `http://localhost:3000` (for development)
8. Authorized redirect URIs:
   - `https://saaskit.pro/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
9. Copy **Client ID** and **Client Secret** to `.env`

### GitHub OAuth

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Application name: `SaaSKit Pro`
4. Homepage URL: `https://saaskit.pro`
5. Authorization callback URL: `https://saaskit.pro/api/auth/callback/github`
6. Click **Register application**
7. Generate a new client secret
8. Copy **Client ID** and **Client Secret** to `.env`

### Important Notes

- Both OAuth apps need the callback URLs to match exactly
- For local development, add `http://localhost:3000` variants
- After going live, remove localhost URLs from production OAuth apps
- Keep secrets out of version control (use `.env` which is gitignored)

---

## 6. Email Setup (Resend)

1. Go to [resend.com](https://resend.com) → Sign up
2. Add your domain: `saaskit.pro`
3. Add DNS records (MX, SPF, DKIM) to your domain registrar
4. Wait for domain verification
5. Create an API key
6. Add to `.env`:
   - `RESEND_API_KEY=re_xxx`
   - `RESEND_FROM_EMAIL=noreply@saaskit.pro`

---

## 7. Product Hunt Launch Preparation

### Before Launch

- [ ] Create Product Hunt account (if not existing)
- [ ] Build "Upcoming" page (2 weeks before launch)
- [ ] Prepare launch assets:
  - [ ] Hero image (1270x760px)
  - [ ] Gallery images (6-8 screenshots)
  - [ ] Demo video (60-90 seconds)
  - [ ] Tagline (60 chars max)
  - [ ] Description (short + full)
- [ ] Prepare comment responses for common questions
- [ ] Line up first supporters (friends, community, Twitter)

### Product Hunt Draft

**Name:** SaaSKit Pro

**Tagline:** Ship your SaaS in days, not months — Next.js 16 boilerplate with Auth, Payments & AI

**Topics:** Developer Tools, SaaS, Productivity

**Description:**

> SaaSKit Pro is a production-ready Next.js 16 SaaS boilerplate that saves you hundreds of hours. Built with Supabase, NextAuth v5, Stripe, and AI (Ollama + OpenRouter), it includes everything you need to launch: authentication (Google, GitHub, email), subscription billing, 7 AI content types with streaming, usage analytics, and dark mode.
>
> Stop reinventing the wheel. Focus on your unique product, not infrastructure.

**Maker Comment Template:**

> Hey everyone! 👋 I built SaaSKit Pro because I was tired of rebuilding the same SaaS infrastructure from scratch every time. This boilerplate includes everything I've learned from shipping multiple SaaS products — auth, payments, AI, rate limiting, and a clean architecture that's easy to extend. Would love your feedback!

### Launch Day Checklist

1. Post on Product Hunt at 12:01 AM PST
2. Share on Twitter/X, LinkedIn
3. Post in relevant communities (r/SaaS, r/webdev, r/nextjs, Indie Hackers)
4. Respond to every comment within 30 minutes
5. Update status throughout the day

---

## 8. Post-Launch Maintenance

### Monitoring
- Set up uptime monitoring (UptimeRobot free tier)
- Monitor Stripe webhook delivery
- Check Supabase logs for errors
- Monitor Docker container health

### Backups
- Supabase: Automatic daily backups on Pro plan
- Server: Set up automated EBS/snapshot backups

### Analytics (Optional)
- Add Google Analytics 4 (already supported via sitemap/robots)
- Add Vercel Analytics or PostHog for product analytics
- Add Sentry for error tracking

---

## Quick Reference: Launch Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Domain DNS configured | ⬜ |
| 2 | SSL certificate (Let's Encrypt) | ⬜ |
| 3 | Supabase project created + migrations run | ⬜ |
| 4 | Stripe products + prices created | ⬜ |
| 5 | Stripe webhook endpoint configured | ⬜ |
| 6 | Google OAuth app registered | ⬜ |
| 7 | GitHub OAuth app registered | ⬜ |
| 8 | Resend domain verified | ⬜ |
| 9 | `.env` file fully configured | ⬜ |
| 10 | Docker deployment running | ⬜ |
| 11 | Demo account created | ⬜ |
| 12 | Gumroad/LemonSqueezy product page live | ⬜ |
| 13 | Product Hunt "Upcoming" page created | ⬜ |
| 14 | Launch day execution | ⬜ |